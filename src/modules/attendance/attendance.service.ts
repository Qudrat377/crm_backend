import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Attendance } from './attendance.entity';
import { Group } from '../groups/group.entity';
import { GroupStudent } from '../groups/group-student.entity';
import {
  CreateAttendanceDto,
  BulkAttendanceDto,
  FilterAttendanceDto,
} from './attendance.dto';
import { AttendanceStatus } from '../../common/enums';
import { paginate } from '../../common/dto/pagination.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
    @InjectRepository(GroupStudent)
    private readonly groupStudentRepo: Repository<GroupStudent>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(filter: FilterAttendanceDto) {
    const qb = this.attendanceRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.student', 'student')
      .leftJoinAndSelect('a.group', 'group')
      .leftJoinAndSelect('a.markedBy', 'markedBy')
      .orderBy('a.lessonDate', 'DESC')
      .addOrderBy('student.fullName', 'ASC')
      .skip(filter.skip)
      .take(filter.limit);

    if (filter.groupId) qb.andWhere('a.groupId = :gid', { gid: filter.groupId });
    if (filter.studentId) qb.andWhere('a.studentId = :sid', { sid: filter.studentId });
    if (filter.status) qb.andWhere('a.status = :status', { status: filter.status });
    if (filter.dateFrom) {
      qb.andWhere('a.lessonDate >= :from', { from: filter.dateFrom });
    }
    if (filter.dateTo) {
      qb.andWhere('a.lessonDate <= :to', { to: filter.dateTo });
    }

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, filter.page, filter.limit);
  }

  async findByGroupAndDate(groupId: string, date: string) {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException(`Guruh topilmadi: ${groupId}`);

    return this.attendanceRepo.find({
      where: { groupId, lessonDate: new Date(date) as any },
      relations: ['student', 'markedBy'],
      order: { student: { fullName: 'ASC' } },
    });
  }

  async markOne(dto: CreateAttendanceDto, markedById: string): Promise<Attendance> {
    await this.validateEnrollment(dto.groupId, dto.studentId);
    this.validateNotFuture(dto.lessonDate);

    return this.upsertAttendance(
      dto.groupId,
      dto.studentId,
      markedById,
      dto.lessonDate,
      dto.status ?? AttendanceStatus.PRESENT,
      dto.note,
    );
  }

  async markBulk(dto: BulkAttendanceDto, markedById: string) {
    const group = await this.groupRepo.findOne({ where: { id: dto.groupId } });
    if (!group) throw new NotFoundException(`Guruh topilmadi: ${dto.groupId}`);

    if (group.status === 'cancelled' || group.status === 'completed') {
      throw new BadRequestException(
        'Yakunlangan yoki bekor qilingan guruh uchun davomat belgilash mumkin emas',
      );
    }

    this.validateNotFuture(dto.lessonDate);

    if (!dto.entries || dto.entries.length === 0) {
      throw new BadRequestException('Davomat yozuvlari bo\'sh bo\'lmasligi kerak');
    }

    // All upserts in a single transaction for consistency
    const results = await this.dataSource.transaction(async (manager) => {
      const saved: Attendance[] = [];

      for (const entry of dto.entries) {
        // Check enrollment (skip unenrolled silently to avoid aborting the whole batch)
        const enrollment = await manager.findOne(GroupStudent, {
          where: { groupId: dto.groupId, studentId: entry.studentId, isActive: true },
        });
        if (!enrollment) continue; // skip non-enrolled students

        // Try update first, then insert
        const existing = await manager.findOne(Attendance, {
          where: {
            groupId: dto.groupId,
            studentId: entry.studentId,
            lessonDate: new Date(dto.lessonDate) as any,
          },
        });

        if (existing) {
          await manager.update(Attendance, existing.id, {
            status: entry.status ?? AttendanceStatus.PRESENT,
            note: entry.note ?? null,
            markedById,
          });
          saved.push({ ...existing, status: entry.status ?? AttendanceStatus.PRESENT });
        } else {
          const record = manager.create(Attendance, {
            groupId: dto.groupId,
            studentId: entry.studentId,
            markedById,
            lessonDate: new Date(dto.lessonDate) as any,
            status: entry.status ?? AttendanceStatus.PRESENT,
            note: entry.note,
          });
          saved.push(await manager.save(Attendance, record));
        }
      }

      return saved;
    });

    return {
      message: `${results.length} ta o'quvchi uchun davomat belgilandi`,
      date: dto.lessonDate,
      groupId: dto.groupId,
      count: results.length,
    };
  }

  async getStudentStats(studentId: string, groupId?: string) {
    const qb = this.attendanceRepo
      .createQueryBuilder('a')
      .select('a.status', 'status')
      .addSelect('COUNT(a.id)', 'count')
      .where('a.studentId = :studentId', { studentId });

    if (groupId) qb.andWhere('a.groupId = :groupId', { groupId });

    const rows = await qb.groupBy('a.status').getRawMany();

    const total = rows.reduce((s, r) => s + parseInt(r.count, 10), 0);
    const presentCount = parseInt(rows.find((r) => r.status === 'present')?.count ?? '0', 10);
    const attendanceRate =
      total > 0 ? ((presentCount / total) * 100).toFixed(1) + '%' : '0%';

    return {
      studentId,
      groupId: groupId ?? 'all',
      total,
      attendanceRate,
      breakdown: rows.map((r) => ({
        status: r.status,
        count: parseInt(r.count, 10),
      })),
    };
  }

  async getGroupStats(groupId: string, dateFrom?: string, dateTo?: string) {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException(`Guruh topilmadi: ${groupId}`);

    const qb = this.attendanceRepo
      .createQueryBuilder('a')
      .select('a.lessonDate', 'lessonDate')
      .addSelect('a.status', 'status')
      .addSelect('COUNT(a.id)', 'count')
      .where('a.groupId = :groupId', { groupId });

    if (dateFrom) qb.andWhere('a.lessonDate >= :from', { from: dateFrom });
    if (dateTo) qb.andWhere('a.lessonDate <= :to', { to: dateTo });

    const rows = await qb
      .groupBy('a.lessonDate, a.status')
      .orderBy('a.lessonDate', 'ASC')
      .getRawMany();

    // Summary by status
    const summaryMap: Record<string, number> = {};
    rows.forEach((r) => {
      summaryMap[r.status] = (summaryMap[r.status] ?? 0) + parseInt(r.count, 10);
    });

    return {
      groupId,
      dateFrom,
      dateTo,
      byDate: rows,
      summary: Object.entries(summaryMap).map(([status, count]) => ({ status, count })),
    };
  }

  // ─── Private helpers ──────────────────────────────────────────

  private async validateEnrollment(groupId: string, studentId: string) {
    const enrollment = await this.groupStudentRepo.findOne({
      where: { groupId, studentId, isActive: true },
    });
    if (!enrollment) {
      throw new BadRequestException('O\'quvchi bu guruhda faol ro\'yxatda emas');
    }
  }

  private validateNotFuture(date: string) {
    if (new Date(date) > new Date()) {
      throw new BadRequestException('Kelajak sanasi uchun davomat belgilash mumkin emas');
    }
  }

  private async upsertAttendance(
    groupId: string,
    studentId: string,
    markedById: string,
    lessonDate: string,
    status: AttendanceStatus,
    note?: string,
  ): Promise<Attendance> {
    const existing = await this.attendanceRepo.findOne({
      where: { groupId, studentId, lessonDate: new Date(lessonDate) as any },
    });

    if (existing) {
      await this.attendanceRepo.update(existing.id, { status, note: note ?? null, markedById });
      return this.attendanceRepo.findOne({
        where: { id: existing.id },
        relations: ['student', 'group', 'markedBy'],
      });
    }

    const record = this.attendanceRepo.create({
      groupId,
      studentId,
      markedById,
      lessonDate: new Date(lessonDate) as any,
      status,
      note,
    });
    await this.attendanceRepo.save(record);
    return this.attendanceRepo.findOne({
      where: { id: record.id },
      relations: ['student', 'group', 'markedBy'],
    });
  }
}
