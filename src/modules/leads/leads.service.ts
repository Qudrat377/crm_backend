import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Lead } from './lead.entity';
import { LeadActivity } from './lead-activity.entity';
import { Branch } from '../branches/branch.entity';
import { User } from '../users/entity/user.entity';
import { Student } from '../students/entity/student.entity';
import {
  CreateLeadDto,
  UpdateLeadDto,
  FilterLeadDto,
  CreateActivityDto,
} from './lead.dto';
import { ActivityType, LeadStatus } from '../../common/enums';
import { paginate } from '../../common/dto/pagination.dto';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
    @InjectRepository(LeadActivity)
    private readonly activityRepo: Repository<LeadActivity>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(filter: FilterLeadDto) {
    const qb = this.leadRepo
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.branch', 'branch')
      .leftJoinAndSelect('lead.assignedTo', 'assignedTo')
      .leftJoinAndSelect('lead.convertedStudent', 'convertedStudent')
      .loadRelationCountAndMap('lead.activityCount', 'lead.activities')
      .orderBy('lead.createdAt', 'DESC')
      .skip(filter.skip)
      .take(filter.limit);

    if (filter.status) {
      qb.andWhere('lead.pipelineStatus = :status', { status: filter.status });
    }
    if (filter.source) {
      qb.andWhere('lead.source = :source', { source: filter.source });
    }
    if (filter.branchId) {
      qb.andWhere('lead.branchId = :branchId', { branchId: filter.branchId });
    }
    if (filter.assignedToId) {
      qb.andWhere('lead.assignedToId = :assignedToId', { assignedToId: filter.assignedToId });
    }
    if (filter.search) {
      qb.andWhere(
        '(lead.fullName ILIKE :s OR lead.phone ILIKE :s)',
        { s: `%${filter.search}%` },
      );
    }

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, filter.page, filter.limit);
  }

  async findById(id: string) {
    const lead = await this.leadRepo.findOne({
      where: { id },
      relations: [
        'branch',
        'assignedTo',
        'convertedStudent',
        'activities',
        'activities.createdBy',
      ],
    });
    if (!lead) throw new NotFoundException(`Lead topilmadi: ${id}`);
    // Sort activities newest first
    lead.activities?.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return lead;
  }

  async create(dto: CreateLeadDto): Promise<Lead> {
    const branch = await this.branchRepo.findOne({ where: { id: dto.branchId } });
    if (!branch) throw new BadRequestException(`Filial topilmadi: ${dto.branchId}`);

    if (dto.assignedToId) {
      const user = await this.userRepo.findOne({ where: { id: dto.assignedToId } });
      if (!user) throw new BadRequestException(`Xodim topilmadi: ${dto.assignedToId}`);
    }

    const lead = this.leadRepo.create({
      fullName: dto.fullName,
      phone: dto.phone,
      branchId: dto.branchId,
      source: dto.source,
      assignedToId: dto.assignedToId ?? null,
      notes: dto.notes,
    });
    return this.leadRepo.save(lead);
  }

  async update(id: string, dto: UpdateLeadDto, updatedById: string): Promise<Lead> {
    const lead = await this.leadRepo.findOne({ where: { id } });
    if (!lead) throw new NotFoundException(`Lead topilmadi: ${id}`);

    // If converting to student, verify student exists
    if (dto.convertedStudentId) {
      const student = await this.studentRepo.findOne({
        where: { id: dto.convertedStudentId, deletedAt: null },
      });
      if (!student) {
        throw new BadRequestException(`O'quvchi topilmadi: ${dto.convertedStudentId}`);
      }
      // Auto-advance status to PAID on conversion
      dto.pipelineStatus = LeadStatus.PAID;
    }

    const previousStatus = lead.pipelineStatus;

    // Use transaction: update lead + auto-log status change activity
    await this.dataSource.transaction(async (manager) => {
      await manager.update(Lead, id, {
        ...(dto.fullName !== undefined && { fullName: dto.fullName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.source !== undefined && { source: dto.source }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.assignedToId !== undefined && { assignedToId: dto.assignedToId }),
        ...(dto.pipelineStatus !== undefined && { pipelineStatus: dto.pipelineStatus }),
        ...(dto.convertedStudentId !== undefined && {
          convertedStudentId: dto.convertedStudentId,
        }),
      });

      // Auto-log status change
      if (dto.pipelineStatus && dto.pipelineStatus !== previousStatus) {
        const activity = manager.create(LeadActivity, {
          leadId: id,
          createdById: updatedById,
          activityType: ActivityType.STATUS_CHANGE,
          description: `Status o'zgardi: "${previousStatus}" → "${dto.pipelineStatus}"`,
        });
        await manager.save(LeadActivity, activity);
      }
    });

    return this.findById(id);
  }

  async addActivity(
    leadId: string,
    dto: CreateActivityDto,
    createdById: string,
  ): Promise<LeadActivity> {
    const lead = await this.leadRepo.findOne({ where: { id: leadId } });
    if (!lead) throw new NotFoundException(`Lead topilmadi: ${leadId}`);

    const activity = this.activityRepo.create({
      leadId,
      createdById,
      activityType: dto.activityType,
      description: dto.description,
    });
    await this.activityRepo.save(activity);

    return this.activityRepo.findOne({
      where: { id: activity.id },
      relations: ['createdBy'],
    });
  }

  async getPipelineSummary(branchId?: string) {
    const where = branchId ? 'lead.branchId = :branchId' : '1=1';
    const params = branchId ? { branchId } : {};

    // Pipeline counts by status
    const pipeline = await this.leadRepo
      .createQueryBuilder('lead')
      .select('lead.pipelineStatus', 'status')
      .addSelect('COUNT(lead.id)', 'count')
      .where(where, params)
      .groupBy('lead.pipelineStatus')
      .getRawMany();

    // Source breakdown
    const sources = await this.leadRepo
      .createQueryBuilder('lead')
      .select('lead.source', 'source')
      .addSelect('COUNT(lead.id)', 'count')
      .where(where, params)
      .groupBy('lead.source')
      .orderBy('count', 'DESC')
      .getRawMany();

    // Conversion stats
    const totalResult = await this.leadRepo
      .createQueryBuilder('lead')
      .select('COUNT(lead.id)', 'total')
      .where(where, params)
      .getRawOne();

    const paidResult = await this.leadRepo
      .createQueryBuilder('lead')
      .select('COUNT(lead.id)', 'paid')
      .where(where, params)
      .andWhere('lead.pipelineStatus = :s', { s: LeadStatus.PAID })
      .getRawOne();

    const total = parseInt(totalResult.total, 10);
    const paid = parseInt(paidResult.paid, 10);

    // Build ordered pipeline funnel
    const statusOrder: LeadStatus[] = [
      LeadStatus.NEW,
      LeadStatus.CONTACTED,
      LeadStatus.TRIAL,
      LeadStatus.REGISTERED,
      LeadStatus.PAID,
      LeadStatus.LOST,
    ];
    const pipelineMap = Object.fromEntries(
      pipeline.map((p) => [p.status, parseInt(p.count, 10)]),
    );

    return {
      pipeline: statusOrder.map((status) => ({
        status,
        count: pipelineMap[status] ?? 0,
      })),
      sources: sources.map((s) => ({
        source: s.source,
        count: parseInt(s.count, 10),
      })),
      conversion: {
        total,
        converted: paid,
        conversionRate: total > 0 ? ((paid / total) * 100).toFixed(1) + '%' : '0%',
      },
    };
  }
}
