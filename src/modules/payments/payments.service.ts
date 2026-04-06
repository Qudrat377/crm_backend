import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Payment } from './payment.entity';
import { Debt } from './debt.entity';
import { SalaryRecord } from './salary-record.entity';
import { GroupStudent } from '../groups/group-student.entity';
import { Teacher } from '../teachers/entity/teacher.entity';
import {
  CreatePaymentDto,
  FilterPaymentDto,
  CreateDebtDto,
  FilterDebtDto,
  CreateSalaryDto,
  FilterSalaryDto,
} from './payment.dto';
import { paginate } from '../../common/dto/pagination.dto';
import { SalaryStatus } from '../../common/enums';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Debt)
    private readonly debtRepo: Repository<Debt>,
    @InjectRepository(SalaryRecord)
    private readonly salaryRepo: Repository<SalaryRecord>,
    @InjectRepository(GroupStudent)
    private readonly groupStudentRepo: Repository<GroupStudent>,
    @InjectRepository(Teacher)
    private readonly teacherRepo: Repository<Teacher>,
    private readonly dataSource: DataSource,
  ) {}

  // ──────────────────────────────────────────────────────────────
  // PAYMENTS
  // ──────────────────────────────────────────────────────────────

  async findAllPayments(filter: FilterPaymentDto) {
    const qb = this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.student', 'student')
      .leftJoinAndSelect('payment.group', 'group')
      .leftJoinAndSelect('payment.recordedBy', 'recordedBy')
      .orderBy('payment.paidAt', 'DESC')
      .skip(filter.skip)
      .take(filter.limit);

    if (filter.studentId) {
      qb.andWhere('payment.studentId = :sid', { sid: filter.studentId });
    }
    if (filter.groupId) {
      qb.andWhere('payment.groupId = :gid', { gid: filter.groupId });
    }
    if (filter.month) {
      qb.andWhere('payment.paymentMonth = :month', { month: filter.month });
    }
    if (filter.year) {
      qb.andWhere('payment.paymentYear = :year', { year: filter.year });
    }
    if (filter.method) {
      qb.andWhere('payment.method = :method', { method: filter.method });
    }
    if (filter.status) {
      qb.andWhere('payment.status = :status', { status: filter.status });
    }
    if (filter.branchId) {
      qb.andWhere('group.branchId = :branchId', { branchId: filter.branchId });
    }

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, filter.page, filter.limit);
  }

  async findPaymentById(id: string): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['student', 'group', 'recordedBy'],
    });
    if (!payment) throw new NotFoundException(`To'lov topilmadi: ${id}`);
    return payment;
  }

  async createPayment(dto: CreatePaymentDto, recordedById: string): Promise<Payment> {
    // Verify student is actively enrolled in the group
    const enrollment = await this.groupStudentRepo.findOne({
      where: { studentId: dto.studentId, groupId: dto.groupId, isActive: true },
    });
    if (!enrollment) {
      throw new BadRequestException('O\'quvchi bu guruhda faol ro\'yxatda emas');
    }

    // Use transaction: create payment + auto-resolve matching debt
    return this.dataSource.transaction(async (manager) => {
      const payment = manager.create(Payment, {
        studentId: dto.studentId,
        groupId: dto.groupId,
        recordedById,
        amount: dto.amount,
        discount: dto.discount ?? 0,
        paymentMonth: dto.paymentMonth,
        paymentYear: dto.paymentYear,
        method: dto.method,
        status: dto.status,
        note: dto.note,
      });
      const saved = await manager.save(Payment, payment);

      // Auto-resolve any debt for same student+group+month+year
      await manager.update(
        Debt,
        {
          studentId: dto.studentId,
          groupId: dto.groupId,
          debtMonth: dto.paymentMonth,
          debtYear: dto.paymentYear,
          isResolved: false,
        },
        { isResolved: true, resolvedAt: new Date() },
      );

      return manager.findOne(Payment, {
        where: { id: saved.id },
        relations: ['student', 'group', 'recordedBy'],
      });
    });
  }

  async getStudentPaymentHistory(studentId: string) {
    // Confirm student exists (soft delete check via repo)
    const exists = await this.paymentRepo.manager.findOne('Student', {
      where: { id: studentId },
    } as any);
    // Proceed regardless — payments history must remain

    const [payments, debts] = await Promise.all([
      this.paymentRepo.find({
        where: { studentId },
        relations: ['group', 'recordedBy'],
        order: { paidAt: 'DESC' },
      }),
      this.debtRepo.find({
        where: { studentId },
        relations: ['group'],
        order: { debtYear: 'DESC', debtMonth: 'DESC' },
      }),
    ]);

    const totalPaid = payments.reduce((s, p) => s + Number(p.amount), 0);
    const totalDiscount = payments.reduce((s, p) => s + Number(p.discount), 0);
    const totalDebt = debts
      .filter((d) => !d.isResolved)
      .reduce((s, d) => s + Number(d.amount), 0);

    return {
      payments,
      debts,
      summary: { totalPaid, totalDiscount, totalDebt },
    };
  }

  async getMonthlyRevenue(branchId: string, year: number) {
    const rows = await this.paymentRepo
      .createQueryBuilder('p')
      .select('p.paymentMonth', 'month')
      .addSelect('p.paymentYear', 'year')
      .addSelect('COALESCE(SUM(p.amount), 0)', 'revenue')
      .addSelect('COUNT(p.id)', 'count')
      .innerJoin('p.group', 'g')
      .where('g.branchId = :branchId', { branchId })
      .andWhere('p.paymentYear = :year', { year })
      .andWhere('p.status = :status', { status: 'paid' })
      .groupBy('p.paymentMonth, p.paymentYear')
      .orderBy('p.paymentMonth', 'ASC')
      .getRawMany();

    const debtTotal = await this.debtRepo
      .createQueryBuilder('d')
      .select('COALESCE(SUM(d.amount), 0)', 'total')
      .addSelect('COUNT(d.id)', 'count')
      .innerJoin('d.group', 'g')
      .where('g.branchId = :branchId', { branchId })
      .andWhere('d.isResolved = false', {})
      .getRawOne();

    // Fill 12 months, even with 0 revenue
    const months = Array.from({ length: 12 }, (_, i) => {
      const found = rows.find((r) => Number(r.month) === i + 1);
      return {
        month: i + 1,
        year,
        revenue: parseFloat(found?.revenue ?? '0'),
        paymentCount: parseInt(found?.count ?? '0', 10),
      };
    });

    return {
      months,
      yearTotal: months.reduce((s, m) => s + m.revenue, 0),
      outstandingDebt: {
        amount: parseFloat(debtTotal.total),
        count: parseInt(debtTotal.count, 10),
      },
    };
  }

  // ──────────────────────────────────────────────────────────────
  // DEBTS
  // ──────────────────────────────────────────────────────────────

  async findDebts(filter: FilterDebtDto) {
    const qb = this.debtRepo
      .createQueryBuilder('debt')
      .leftJoinAndSelect('debt.student', 'student')
      .leftJoinAndSelect('debt.group', 'group')
      .orderBy('debt.debtYear', 'DESC')
      .addOrderBy('debt.debtMonth', 'DESC');

    if (filter.studentId) qb.andWhere('debt.studentId = :sid', { sid: filter.studentId });
    if (filter.groupId) qb.andWhere('debt.groupId = :gid', { gid: filter.groupId });
    if (filter.isResolved !== undefined) {
      qb.andWhere('debt.isResolved = :ir', { ir: filter.isResolved });
    }
    if (filter.branchId) {
      qb.andWhere('group.branchId = :branchId', { branchId: filter.branchId });
    }

    return qb.getMany();
  }

  async createDebt(dto: CreateDebtDto): Promise<Debt> {
    // Verify enrollment
    const enrollment = await this.groupStudentRepo.findOne({
      where: { studentId: dto.studentId, groupId: dto.groupId, isActive: true },
    });
    if (!enrollment) {
      throw new BadRequestException('O\'quvchi bu guruhda faol ro\'yxatda emas');
    }

    // Upsert: if debt exists re-open it, otherwise create
    const existing = await this.debtRepo.findOne({
      where: {
        studentId: dto.studentId,
        groupId: dto.groupId,
        debtMonth: dto.debtMonth,
        debtYear: dto.debtYear,
      },
    });

    if (existing) {
      await this.debtRepo.update(existing.id, {
        amount: dto.amount,
        isResolved: false,
        resolvedAt: null,
      });
      return this.debtRepo.findOne({ where: { id: existing.id }, relations: ['student', 'group'] });
    }

    const debt = this.debtRepo.create({
      studentId: dto.studentId,
      groupId: dto.groupId,
      amount: dto.amount,
      debtMonth: dto.debtMonth,
      debtYear: dto.debtYear,
    });
    return this.debtRepo.save(debt);
  }

  async resolveDebt(debtId: string): Promise<Debt> {
    const debt = await this.debtRepo.findOne({ where: { id: debtId } });
    if (!debt) throw new NotFoundException(`Qarz topilmadi: ${debtId}`);
    if (debt.isResolved) throw new BadRequestException('Bu qarz allaqachon yopilgan');

    await this.debtRepo.update(debtId, { isResolved: true, resolvedAt: new Date() });
    return this.debtRepo.findOne({ where: { id: debtId }, relations: ['student', 'group'] });
  }

  // ──────────────────────────────────────────────────────────────
  // SALARY RECORDS
  // ──────────────────────────────────────────────────────────────

  async findSalaries(filter: FilterSalaryDto) {
    const qb = this.salaryRepo
      .createQueryBuilder('salary')
      .leftJoinAndSelect('salary.teacher', 'teacher')
      .leftJoinAndSelect('salary.processedBy', 'processedBy')
      .orderBy('salary.salaryYear', 'DESC')
      .addOrderBy('salary.salaryMonth', 'DESC')
      .skip(filter.skip)
      .take(filter.limit);

    if (filter.teacherId) qb.andWhere('salary.teacherId = :tid', { tid: filter.teacherId });
    if (filter.status) qb.andWhere('salary.status = :status', { status: filter.status });
    if (filter.year) qb.andWhere('salary.salaryYear = :year', { year: filter.year });

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, filter.page, filter.limit);
  }

  async createSalary(dto: CreateSalaryDto, processedById: string): Promise<SalaryRecord> {
    const teacher = await this.teacherRepo.findOne({
      where: { id: dto.teacherId, deletedAt: null },
    });
    if (!teacher) throw new NotFoundException(`O'qituvchi topilmadi: ${dto.teacherId}`);

    // Check duplicate
    const existing = await this.salaryRepo.findOne({
      where: {
        teacherId: dto.teacherId,
        salaryMonth: dto.salaryMonth,
        salaryYear: dto.salaryYear,
      },
    });
    if (existing) {
      throw new ConflictException(
        `Bu oy uchun maosh yozuvi allaqachon mavjud (${dto.salaryMonth}/${dto.salaryYear})`,
      );
    }

    const bonus = dto.bonus ?? 0;
    const deduction = dto.deduction ?? 0;
    const netAmount = dto.baseAmount + bonus - deduction;

    const salary = this.salaryRepo.create({
      teacherId: dto.teacherId,
      processedById,
      baseAmount: dto.baseAmount,
      bonus,
      deduction,
      netAmount,
      salaryMonth: dto.salaryMonth,
      salaryYear: dto.salaryYear,
    });
    return this.salaryRepo.save(salary);
  }

  async markSalaryPaid(salaryId: string): Promise<SalaryRecord> {
    const salary = await this.salaryRepo.findOne({ where: { id: salaryId } });
    if (!salary) throw new NotFoundException(`Maosh yozuvi topilmadi: ${salaryId}`);
    if (salary.status === SalaryStatus.PAID) {
      throw new BadRequestException('Bu maosh allaqachon to\'langan');
    }

    await this.salaryRepo.update(salaryId, {
      status: SalaryStatus.PAID,
      paidAt: new Date(),
    });
    return this.salaryRepo.findOne({
      where: { id: salaryId },
      relations: ['teacher', 'processedBy'],
    });
  }
}
