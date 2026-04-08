import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from './entity/teacher.entity';
import { User } from '../users/entity/user.entity';
import { Branch } from '../branches/branch.entity';
// import { CreateTeacherDto, UpdateTeacherDto, FilterTeacherDto } from './teacher.dto';
import { paginate } from '../../common/dto/pagination.dto';
// import { FilterTeacherDto } from './dto/filter-teacher.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { FilterTeacherDto } from './dto/filter-teacher.dto';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepo: Repository<Teacher>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
  ) {}

  async findAll(filter: FilterTeacherDto) {
    const qb = this.teacherRepo
      .createQueryBuilder('teacher')
      .leftJoinAndSelect('teacher.user', 'user')
      .leftJoinAndSelect('teacher.branch', 'branch')
      .leftJoinAndSelect('teacher.groups', 'group', 'group.status = :gStatus', { gStatus: 'active' })
      .where('teacher.deletedAt IS NULL')
      .orderBy('teacher.fullName', 'ASC')
      .skip(filter.skip)
      .take(filter.limit);

    if (filter.branchId) {
      qb.andWhere('teacher.branchId = :branchId', { branchId: filter.branchId });
    }
    if (filter.isActive !== undefined) {
      qb.andWhere('teacher.isActive = :isActive', { isActive: filter.isActive });
    }
    if (filter.search) {
      qb.andWhere(
        `(teacher.fullName ILIKE :s OR teacher.phone ILIKE :s OR teacher.specialization ILIKE :s)`,
        { s: `%${filter.search}%` },
      );
    }

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, filter.page, filter.limit);
  }

  async findById(id: string) {
    const teacher = await this.teacherRepo.findOne({
      where: { id, deletedAt: null },
      relations: ['user', 'branch', 'groups', 'groups.course', 'salaryRecords'],
    });
    if (!teacher) throw new NotFoundException(`O'qituvchi topilmadi: ${id}`);

    // Compute stats
    const activeGroups = teacher.groups?.filter((g) => g.status === 'active').length ?? 0;
    const totalSalaryPaid = teacher.salaryRecords
      ?.filter((s) => s.status === 'paid')
      .reduce((sum, s) => sum + Number(s.netAmount), 0) ?? 0;

    return { ...teacher, stats: { activeGroups, totalSalaryPaid } };
  }

  async create(dto: CreateTeacherDto) {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new BadRequestException(`Foydalanuvchi topilmadi: ${dto.userId}`);

    const existingProfile = await this.teacherRepo.findOne({
      where: { userId: dto.userId, deletedAt: null },
    });
    if (existingProfile) {
      throw new ConflictException('Bu foydalanuvchida allaqachon o\'qituvchi profili mavjud');
    }

    const branch = await this.branchRepo.findOne({ where: { id: dto.branchId } });
    if (!branch) throw new BadRequestException(`Filial topilmadi: ${dto.branchId}`);

    const teacher = this.teacherRepo.create({
      userId: dto.userId,
      branchId: dto.branchId,
      fullName: dto.fullName,
      phone: dto.phone,
      specialization: dto.specialization,
      monthlySalary: dto.monthlySalary ?? 0,
      hiredAt: dto.hiredAt ? new Date(dto.hiredAt) : new Date(),
    });
    return this.teacherRepo.save(teacher);
  }

  async update(id: string, dto: UpdateTeacherDto) {
    await this.findById(id);

    if (dto.branchId) {
      const branch = await this.branchRepo.findOne({ where: { id: dto.branchId } });
      if (!branch) throw new BadRequestException(`Filial topilmadi: ${dto.branchId}`);
    }

    await this.teacherRepo.update(id, {
      ...(dto.fullName !== undefined && { fullName: dto.fullName }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.specialization !== undefined && { specialization: dto.specialization }),
      ...(dto.monthlySalary !== undefined && { monthlySalary: dto.monthlySalary }),
      ...(dto.branchId !== undefined && { branchId: dto.branchId }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    });

    return this.findById(id);
  }

  async softDelete(id: string): Promise<{ message: string }> {
    const teacher = await this.teacherRepo.findOne({
      where: { id, deletedAt: null },
      relations: ['groups'],
    });
    if (!teacher) throw new NotFoundException(`O'qituvchi topilmadi: ${id}`);

    const activeGroups = teacher.groups?.filter((g) => g.status === 'active') ?? [];
    if (activeGroups.length > 0) {
      throw new ConflictException(
        `O'qituvchida ${activeGroups.length} ta faol guruh mavjud. Avval guruhlarni boshqa o'qituvchiga o'tkazing`,
      );
    }

    await this.teacherRepo.softDelete(id);
    await this.teacherRepo.update(id, { isActive: false });
    return { message: 'O\'qituvchi o\'chirildi' };
  }
}
