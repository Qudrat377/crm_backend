import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './course.entity';
import { Branch } from '../branches/branch.entity';
import { CreateCourseDto, UpdateCourseDto } from './course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
  ) {}

  async findAll(branchId?: string): Promise<Course[]> {
    const qb = this.courseRepo
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.branch', 'branch')
      .orderBy('course.createdAt', 'DESC');

    if (branchId) qb.where('course.branchId = :branchId', { branchId });

    return qb.getMany();
  }

  async findById(id: string): Promise<Course> {
    const course = await this.courseRepo.findOne({
      where: { id },
      relations: ['branch'],
    });
    if (!course) throw new NotFoundException(`Kurs topilmadi: ${id}`);
    return course;
  }

  async create(dto: CreateCourseDto): Promise<Course> {
    const branch = await this.branchRepo.findOne({ where: { id: dto.branchId } });
    if (!branch) throw new BadRequestException(`Filial topilmadi: ${dto.branchId}`);

    const course = this.courseRepo.create({
      name: dto.name,
      description: dto.description,
      pricePerMonth: dto.pricePerMonth,
      durationMonths: dto.durationMonths ?? 1,
      branchId: dto.branchId,
    });
    return this.courseRepo.save(course);
  }

  async update(id: string, dto: UpdateCourseDto): Promise<Course> {
    await this.findById(id);
    await this.courseRepo.update(id, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.pricePerMonth !== undefined && { pricePerMonth: dto.pricePerMonth }),
      ...(dto.durationMonths !== undefined && { durationMonths: dto.durationMonths }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    });
    return this.findById(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const course = await this.courseRepo.findOne({
      where: { id },
      relations: ['groups'],
    });
    if (!course) throw new NotFoundException(`Kurs topilmadi: ${id}`);
    if (course.groups?.length > 0) {
      throw new BadRequestException(
        `Bu kursda ${course.groups.length} ta guruh mavjud. Avval guruhlarni o'chiring`,
      );
    }
    await this.courseRepo.remove(course);
    return { message: 'Kurs o\'chirildi' };
  }
}
