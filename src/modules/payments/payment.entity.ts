import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PaymentMethod, PaymentStatus } from '../../common/enums';
import { Student } from '../students/entity/student.entity';
import { Group } from '../groups/group.entity';
import { User } from '../users/entity/user.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  // Discount applied before calculating net
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount: number;

  @Column({
    name: 'payment_month',
    type: 'smallint',
    comment: '1-12',
  })
  paymentMonth: number;

  @Column({ name: 'payment_year', type: 'smallint' })
  paymentYear: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
  })
  method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PAID,
  })
  status: PaymentStatus;

  @Column({ type: 'text', nullable: true })
  note: string;

  @CreateDateColumn({ name: 'paid_at', type: 'timestamptz' })
  paidAt: Date;

  // ─── Foreign keys ─────────────────────────────────────────────

  @Column({ name: 'student_id' })
  studentId: string;

  @Column({ name: 'group_id' })
  groupId: string;

  @Column({ name: 'recorded_by_id' })
  recordedById: string;

  // ─── Relations ────────────────────────────────────────────────

  // ON DELETE RESTRICT — keep payment history even if student is removed
  @ManyToOne(() => Student, (student) => student.payments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  // ON DELETE RESTRICT — keep payment history even if group is removed
  @ManyToOne(() => Group, (group) => group.payments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  // ON DELETE RESTRICT — keep record of who recorded the payment
  @ManyToOne(() => User, (user) => user.recordedPayments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'recorded_by_id' })
  recordedBy: User;
}
