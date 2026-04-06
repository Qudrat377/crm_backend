import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Student } from './entity/student.entity';
import { GroupStudent } from '../groups/group-student.entity';
import { Group } from '../groups/group.entity';
import { Branch } from '../branches/branch.entity';
import { Payment } from '../payments/payment.entity';
import { Debt } from '../payments/debt.entity';
// import { User } from '../users/entities/user.entity';
// import { CreateStudentDto, UpdateStudentDto, FilterStudentDto } from './student.dto';
import { paginate } from '../../common/dto/pagination.dto';
import { User } from '../users/entity/user.entity';
import { FilterStudentDto } from './dto/filter-student.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(GroupStudent)
    private readonly groupStudentRepo: Repository<GroupStudent>,
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Debt)
    private readonly debtRepo: Repository<Debt>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(filter: FilterStudentDto) {
    const qb = this.studentRepo
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.branch', 'branch')
      .leftJoinAndSelect('student.user', 'user')
      .leftJoinAndSelect(
        'student.groupStudents',
        'gs',
        'gs.isActive = true',
      )
      .leftJoinAndSelect('gs.group', 'group')
      .leftJoinAndSelect('group.course', 'course')
      .leftJoinAndSelect('group.teacher', 'teacher')
      .where('student.deletedAt IS NULL')
      .orderBy('student.createdAt', 'DESC')
      .skip(filter.skip)
      .take(filter.limit);

    if (filter.status) {
      qb.andWhere('student.status = :status', { status: filter.status });
    }
    if (filter.branchId) {
      qb.andWhere('student.branchId = :branchId', { branchId: filter.branchId });
    }
    if (filter.userId) {
      qb.andWhere('student.userId = :userId', { userId: filter.userId });
    }
    if (filter.search) {
      qb.andWhere(
        `(student.fullName ILIKE :search 
          OR student.phone ILIKE :search 
          OR student.parentName ILIKE :search 
          OR student.parentPhone ILIKE :search)`,
        { search: `%${filter.search}%` },
      );
    }
    if (filter.groupId) {
      qb.andWhere(
        'EXISTS (SELECT 1 FROM group_students gs2 WHERE gs2.student_id = student.id AND gs2.group_id = :groupId AND gs2.is_active = true)',
        { groupId: filter.groupId },
      );
    }

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, filter.page, filter.limit);
  }

  async findById(id: string): Promise<Student & { paymentSummary: any }> {
    const student = await this.studentRepo.findOne({
      where: { id, deletedAt: null },
      relations: [
        'branch',
        'user', // User bog'liqligi qo'shildi
        'groupStudents',
        'groupStudents.group',
        'groupStudents.group.course',
        'groupStudents.group.teacher',
        'payments',
        'debts',
      ],
    });
    if (!student) throw new NotFoundException(`O'quvchi topilmadi: ${id}`);

    // Payment summary
    const totalPaidResult = await this.paymentRepo
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.amount), 0)', 'total')
      .where('p.studentId = :id', { id })
      .getRawOne();

    const totalDebtResult = await this.debtRepo
      .createQueryBuilder('d')
      .select('COALESCE(SUM(d.amount), 0)', 'total')
      .where('d.studentId = :id AND d.isResolved = false', { id })
      .getRawOne();

    const paymentSummary = {
      totalPaid: parseFloat(totalPaidResult.total),
      totalDebt: parseFloat(totalDebtResult.total),
    };

    return { ...student, paymentSummary };
  }

  async create(dto: CreateStudentDto): Promise<Student> {
    const branch = await this.branchRepo.findOne({ where: { id: dto.branchId } });
    if (!branch) throw new BadRequestException(`Filial topilmadi: ${dto.branchId}`);

    if (dto.userId) {
      const user = await this.userRepo.findOne({ where: { id: dto.userId } });
      if (!user) throw new BadRequestException(`Foydalanuvchi topilmadi: ${dto.userId}`);
      
      const existingStudent = await this.studentRepo.findOne({ where: { userId: dto.userId } });
      if (existingStudent) throw new ConflictException('Bu foydalanuvchiga allaqachon o\'quvchi biriktirilgan');
    }

    const student = this.studentRepo.create({
      fullName: dto.fullName,
      phone: dto.phone,
      parentName: dto.parentName,
      parentPhone: dto.parentPhone,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
      address: dto.address,
      branchId: dto.branchId,
      userId: dto.userId || null,
      status: dto.status,
    });
    return this.studentRepo.save(student);
  }

  async update(id: string, dto: UpdateStudentDto): Promise<Student> {
    const student = await this.studentRepo.findOne({ where: { id, deletedAt: null } });
    if (!student) throw new NotFoundException(`O'quvchi topilmadi: ${id}`);

    if (dto.branchId) {
      const branch = await this.branchRepo.findOne({ where: { id: dto.branchId } });
      if (!branch) throw new BadRequestException(`Filial topilmadi: ${dto.branchId}`);
    }

    if (dto.userId) {
      const user = await this.userRepo.findOne({ where: { id: dto.userId } });
      if (!user) throw new BadRequestException(`Foydalanuvchi topilmadi: ${dto.userId}`);
      
      const existingStudent = await this.studentRepo.findOne({ 
        where: { userId: dto.userId, id: this.studentRepo.manager.connection.driver.options.type === 'postgres' ? (id as any) : id } 
      });
      // Boshqa studentga tegishli ekanini tekshirish
      const checkOther = await this.studentRepo.createQueryBuilder('s')
        .where('s.userId = :userId AND s.id != :id', { userId: dto.userId, id })
        .getOne();
      if (checkOther) throw new ConflictException('Bu foydalanuvchi boshqa o\'quvchiga biriktirilgan');
    }

    await this.studentRepo.update(id, {
      ...(dto.fullName !== undefined && { fullName: dto.fullName }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.parentName !== undefined && { parentName: dto.parentName }),
      ...(dto.parentPhone !== undefined && { parentPhone: dto.parentPhone }),
      ...(dto.birthDate !== undefined && { birthDate: dto.birthDate ? new Date(dto.birthDate) : null }),
      ...(dto.address !== undefined && { address: dto.address }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.branchId !== undefined && { branchId: dto.branchId }),
      ...(dto.userId !== undefined && { userId: dto.userId }),
    });

    return this.studentRepo.findOne({
      where: { id },
      relations: ['branch', 'user'],
    });
  }

  async softDelete(id: string): Promise<{ message: string }> {
    const student = await this.studentRepo.findOne({ where: { id, deletedAt: null } });
    if (!student) throw new NotFoundException(`O'quvchi topilmadi: ${id}`);

    await this.dataSource.transaction(async (manager) => {
      await manager.update(GroupStudent, { studentId: id, isActive: true }, {
        isActive: false,
        leftAt: new Date(),
      });
      await manager.softDelete(Student, id);
    });

    return { message: "O'quvchi o'chirildi" };
  }

  async assignToGroup(studentId: string, groupId: string): Promise<GroupStudent> {
    const student = await this.studentRepo.findOne({ where: { id: studentId, deletedAt: null } });
    if (!student) throw new NotFoundException(`O'quvchi topilmadi: ${studentId}`);

    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['groupStudents'],
    });
    if (!group) throw new NotFoundException(`Guruh topilmadi: ${groupId}`);

    if (group.status === 'cancelled' || group.status === 'completed') {
      throw new BadRequestException("Yakunlangan yoki bekor qilingan guruhga qo'sha olmaysiz");
    }

    const activeCount = group.groupStudents?.filter((gs) => gs.isActive).length ?? 0;
    if (activeCount >= group.maxStudents) {
      throw new ConflictException(`Guruh to'lgan (${group.maxStudents} ta limit)`);
    }

    const existing = await this.groupStudentRepo.findOne({
      where: { groupId, studentId },
    });

    if (existing) {
      if (existing.isActive) {
        throw new ConflictException("O'quvchi bu guruhga allaqachon qo'shilgan");
      }
      await this.groupStudentRepo.update(existing.id, {
        isActive: true,
        leftAt: null,
      });
      return this.groupStudentRepo.findOne({ where: { id: existing.id } });
    }

    const enrollment = this.groupStudentRepo.create({ groupId, studentId });
    return this.groupStudentRepo.save(enrollment);
  }

  async removeFromGroup(studentId: string, groupId: string): Promise<{ message: string }> {
    const enrollment = await this.groupStudentRepo.findOne({
      where: { studentId, groupId, isActive: true },
    });
    if (!enrollment) {
      throw new NotFoundException("Faol ro'yxatga yozilish topilmadi");
    }

    await this.groupStudentRepo.update(enrollment.id, {
      isActive: false,
      leftAt: new Date(),
    });
    return { message: "O'quvchi guruhdan chiqarildi" };
  }
}

// import {
//   Injectable,
//   NotFoundException,
//   BadRequestException,
//   ConflictException,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository, DataSource } from 'typeorm';
// import { Student } from './student.entity';
// import { GroupStudent } from '../groups/group-student.entity';
// import { Group } from '../groups/group.entity';
// import { Branch } from '../branches/branch.entity';
// import { Payment } from '../payments/payment.entity';
// import { Debt } from '../payments/debt.entity';
// // import { CreateStudentDto, UpdateStudentDto, FilterStudentDto } from './student.dto';
// import { paginate } from '../../common/dto/pagination.dto';
// import { FilterStudentDto } from './dto/filter-student.dto';
// import { CreateStudentDto } from './dto/create-student.dto';
// import { UpdateStudentDto } from './dto/update-student.dto';

// @Injectable()
// export class StudentsService {
//   constructor(
//     @InjectRepository(Student)
//     private readonly studentRepo: Repository<Student>,
//     @InjectRepository(GroupStudent)
//     private readonly groupStudentRepo: Repository<GroupStudent>,
//     @InjectRepository(Group)
//     private readonly groupRepo: Repository<Group>,
//     @InjectRepository(Branch)
//     private readonly branchRepo: Repository<Branch>,
//     @InjectRepository(Payment)
//     private readonly paymentRepo: Repository<Payment>,
//     @InjectRepository(Debt)
//     private readonly debtRepo: Repository<Debt>,
//     private readonly dataSource: DataSource,
//   ) {}

//   async findAll(filter: FilterStudentDto) {
//     const qb = this.studentRepo
//       .createQueryBuilder('student')
//       .leftJoinAndSelect('student.branch', 'branch')
//       .leftJoinAndSelect(
//         'student.groupStudents',
//         'gs',
//         'gs.isActive = true',
//       )
//       .leftJoinAndSelect('gs.group', 'group')
//       .leftJoinAndSelect('group.course', 'course')
//       .leftJoinAndSelect('group.teacher', 'teacher')
//       .where('student.deletedAt IS NULL')
//       .orderBy('student.createdAt', 'DESC')
//       .skip(filter.skip)
//       .take(filter.limit);

//     if (filter.status) {
//       qb.andWhere('student.status = :status', { status: filter.status });
//     }
//     if (filter.branchId) {
//       qb.andWhere('student.branchId = :branchId', { branchId: filter.branchId });
//     }
//     if (filter.search) {
//       qb.andWhere(
//         `(student.fullName ILIKE :search
//           OR student.phone ILIKE :search
//           OR student.parentName ILIKE :search
//           OR student.parentPhone ILIKE :search)`,
//         { search: `%${filter.search}%` },
//       );
//     }
//     if (filter.groupId) {
//       qb.andWhere(
//         'EXISTS (SELECT 1 FROM group_students gs2 WHERE gs2.student_id = student.id AND gs2.group_id = :groupId AND gs2.is_active = true)',
//         { groupId: filter.groupId },
//       );
//     }

//     const [data, total] = await qb.getManyAndCount();
//     return paginate(data, total, filter.page, filter.limit);
//   }

//   async findById(id: string): Promise<Student & { paymentSummary: any }> {
//     const student = await this.studentRepo.findOne({
//       where: { id, deletedAt: null },
//       relations: [
//         'branch',
//         'groupStudents',
//         'groupStudents.group',
//         'groupStudents.group.course',
//         'groupStudents.group.teacher',
//         'payments',
//         'debts',
//       ],
//     });
//     if (!student) throw new NotFoundException(`O'quvchi topilmadi: ${id}`);

//     // Payment summary
//     const totalPaidResult = await this.paymentRepo
//       .createQueryBuilder('p')
//       .select('COALESCE(SUM(p.amount), 0)', 'total')
//       .where('p.studentId = :id', { id })
//       .getRawOne();

//     const totalDebtResult = await this.debtRepo
//       .createQueryBuilder('d')
//       .select('COALESCE(SUM(d.amount), 0)', 'total')
//       .where('d.studentId = :id AND d.isResolved = false', { id })
//       .getRawOne();

//     const paymentSummary = {
//       totalPaid: parseFloat(totalPaidResult.total),
//       totalDebt: parseFloat(totalDebtResult.total),
//     };

//     return { ...student, paymentSummary };
//   }

//   async create(dto: CreateStudentDto): Promise<Student> {
//     const branch = await this.branchRepo.findOne({ where: { id: dto.branchId } });
//     if (!branch) throw new BadRequestException(`Filial topilmadi: ${dto.branchId}`);

//     const student = this.studentRepo.create({
//       fullName: dto.fullName,
//       phone: dto.phone,
//       parentName: dto.parentName,
//       parentPhone: dto.parentPhone,
//       birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
//       address: dto.address,
//       branchId: dto.branchId,
//       status: dto.status,
//     });
//     return this.studentRepo.save(student);
//   }

//   async update(id: string, dto: UpdateStudentDto): Promise<Student> {
//     const student = await this.studentRepo.findOne({ where: { id, deletedAt: null } });
//     if (!student) throw new NotFoundException(`O'quvchi topilmadi: ${id}`);

//     if (dto.branchId) {
//       const branch = await this.branchRepo.findOne({ where: { id: dto.branchId } });
//       if (!branch) throw new BadRequestException(`Filial topilmadi: ${dto.branchId}`);
//     }

//     await this.studentRepo.update(id, {
//       ...(dto.fullName !== undefined && { fullName: dto.fullName }),
//       ...(dto.phone !== undefined && { phone: dto.phone }),
//       ...(dto.parentName !== undefined && { parentName: dto.parentName }),
//       ...(dto.parentPhone !== undefined && { parentPhone: dto.parentPhone }),
//       ...(dto.birthDate !== undefined && { birthDate: dto.birthDate ? new Date(dto.birthDate) : null }),
//       ...(dto.address !== undefined && { address: dto.address }),
//       ...(dto.status !== undefined && { status: dto.status }),
//       ...(dto.branchId !== undefined && { branchId: dto.branchId }),
//     });

//     return this.studentRepo.findOne({
//       where: { id },
//       relations: ['branch'],
//     });
//   }

//   async softDelete(id: string): Promise<{ message: string }> {
//     const student = await this.studentRepo.findOne({ where: { id, deletedAt: null } });
//     if (!student) throw new NotFoundException(`O'quvchi topilmadi: ${id}`);

//     // Use transaction: deactivate all group enrollments then soft delete
//     await this.dataSource.transaction(async (manager) => {
//       await manager.update(GroupStudent, { studentId: id, isActive: true }, {
//         isActive: false,
//         leftAt: new Date(),
//       });
//       await manager.softDelete(Student, id);
//     });

//     return { message: 'O\'quvchi o\'chirildi' };
//   }

//   async assignToGroup(studentId: string, groupId: string): Promise<GroupStudent> {
//     const student = await this.studentRepo.findOne({ where: { id: studentId, deletedAt: null } });
//     if (!student) throw new NotFoundException(`O'quvchi topilmadi: ${studentId}`);

//     const group = await this.groupRepo.findOne({
//       where: { id: groupId },
//       relations: ['groupStudents'],
//     });
//     if (!group) throw new NotFoundException(`Guruh topilmadi: ${groupId}`);

//     if (group.status === 'cancelled' || group.status === 'completed') {
//       throw new BadRequestException('Yakunlangan yoki bekor qilingan guruhga qo\'sha olmaysiz');
//     }

//     // Check capacity
//     const activeCount = group.groupStudents?.filter((gs) => gs.isActive).length ?? 0;
//     if (activeCount >= group.maxStudents) {
//       throw new ConflictException(`Guruh to'lgan (${group.maxStudents} ta limit)`);
//     }

//     // Check existing enrollment
//     const existing = await this.groupStudentRepo.findOne({
//       where: { groupId, studentId },
//     });

//     if (existing) {
//       if (existing.isActive) {
//         throw new ConflictException('O\'quvchi bu guruhga allaqachon qo\'shilgan');
//       }
//       // Re-activate
//       await this.groupStudentRepo.update(existing.id, {
//         isActive: true,
//         leftAt: null,
//       });
//       return this.groupStudentRepo.findOne({ where: { id: existing.id } });
//     }

//     const enrollment = this.groupStudentRepo.create({ groupId, studentId });
//     return this.groupStudentRepo.save(enrollment);
//   }

//   async removeFromGroup(studentId: string, groupId: string): Promise<{ message: string }> {
//     const enrollment = await this.groupStudentRepo.findOne({
//       where: { studentId, groupId, isActive: true },
//     });
//     if (!enrollment) {
//       throw new NotFoundException('Faol ro\'yxatga yozilish topilmadi');
//     }

//     await this.groupStudentRepo.update(enrollment.id, {
//       isActive: false,
//       leftAt: new Date(),
//     });
//     return { message: 'O\'quvchi guruhdan chiqarildi' };
//   }
// }
