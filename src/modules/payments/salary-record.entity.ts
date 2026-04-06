import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { SalaryStatus } from '../../common/enums';
import { Teacher } from '../teachers/entity/teacher.entity';
import { User } from '../users/entity/user.entity';

@Entity('salary_records')
@Unique(['teacherId', 'salaryMonth', 'salaryYear']) // one salary per teacher per month
export class SalaryRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'base_amount', type: 'decimal', precision: 12, scale: 2 })
  baseAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  bonus: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  deduction: number;

  // net_amount = base_amount + bonus - deduction
  @Column({ name: 'net_amount', type: 'decimal', precision: 12, scale: 2 })
  netAmount: number;

  @Column({ name: 'salary_month', type: 'smallint' })
  salaryMonth: number;

  @Column({ name: 'salary_year', type: 'smallint' })
  salaryYear: number;

  @Column({
    type: 'enum',
    enum: SalaryStatus,
    default: SalaryStatus.PENDING,
  })
  status: SalaryStatus;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  // ─── Foreign keys ─────────────────────────────────────────────

  @Column({ name: 'teacher_id' })
  teacherId: string;

  @Column({ name: 'processed_by_id' })
  processedById: string;

  // ─── Relations ────────────────────────────────────────────────

  @ManyToOne(() => Teacher, (teacher) => teacher.salaryRecords, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @ManyToOne(() => User, (user) => user.processedSalaries, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'processed_by_id' })
  processedBy: User;
}
