import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './branch.entity';
import { CreateBranchDto, UpdateBranchDto } from './branch.dto';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
  ) {}

  async findAll(): Promise<Branch[]> {
    return this.branchRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Branch> {
    const branch = await this.branchRepo.findOne({ where: { id } });
    if (!branch) throw new NotFoundException(`Filial topilmadi: ${id}`);
    return branch;
  }

  async create(dto: CreateBranchDto): Promise<Branch> {
    const branch = this.branchRepo.create(dto);
    return this.branchRepo.save(branch);
  }

  async update(id: string, dto: UpdateBranchDto): Promise<Branch> {
    await this.findById(id);
    await this.branchRepo.update(id, dto);
    return this.findById(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const branch = await this.findById(id);
    // TypeORM will throw QueryFailedError (23503) if related records exist
    // GlobalExceptionFilter handles this gracefully
    await this.branchRepo.remove(branch);
    return { message: 'Filial o\'chirildi' };
  }

  async getStats(id: string) {
    await this.findById(id);

    const result = await this.branchRepo
      .createQueryBuilder('branch')
      .leftJoinAndSelect('branch.teachers', 'teacher', 'teacher.isActive = true AND teacher.deleted_at IS NULL')
      .leftJoinAndSelect('branch.students', 'student', 'student.status = :status AND student.deleted_at IS NULL', { status: 'active' })
      .leftJoinAndSelect('branch.groups', 'group', 'group.status = :gStatus', { gStatus: 'active' })
      .where('branch.id = :id', { id })
      .getOne();

    return {
      id: result.id,
      name: result.name,
      activeTeachers: result.teachers?.length ?? 0,
      activeStudents: result.students?.length ?? 0,
      activeGroups: result.groups?.length ?? 0,
    };
  }
}
