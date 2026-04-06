import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Student } from '../students/entity/student.entity';
import { Group } from '../groups/group.entity';

@Entity('debts')
@Unique(['studentId', 'groupId', 'debtMonth', 'debtYear']) // one debt per student per group per month
export class Debt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ name: 'debt_month', type: 'smallint' })
  debtMonth: number;

  @Column({ name: 'debt_year', type: 'smallint' })
  debtYear: number;

  @Column({ name: 'is_resolved', default: false })
  isResolved: boolean;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  // ─── Foreign keys ─────────────────────────────────────────────

  @Column({ name: 'student_id' })
  studentId: string;

  @Column({ name: 'group_id' })
  groupId: string;

  // ─── Relations ────────────────────────────────────────────────

  // ON DELETE RESTRICT — keep debt records even if student is removed
  @ManyToOne(() => Student, (student) => student.debts, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  // ON DELETE RESTRICT — keep debt records even if group is removed
  @ManyToOne(() => Group, (group) => group.debts, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'group_id' })
  group: Group;
}
