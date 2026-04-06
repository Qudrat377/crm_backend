import {
  Entity,
  Column,
  OneToOne,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { SoftDeleteBaseEntity } from '../../../database/base.entity';
import { User } from '../../users/entity/user.entity';
import { Branch } from '../../branches/branch.entity';
import { Group } from '../../groups/group.entity';
import { SalaryRecord } from '../../payments/salary-record.entity';

@Entity('teachers')
export class Teacher extends SoftDeleteBaseEntity {
  @Column({ name: 'full_name', length: 255 })
  fullName: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  specialization: string;

  @Column({
    name: 'monthly_salary',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  monthlySalary: number;

  @Column({ name: 'hired_at', type: 'date', default: () => 'CURRENT_DATE' })
  hiredAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // ─── Foreign keys ─────────────────────────────────────────────

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'branch_id' })
  branchId: string;

  // ─── Relations ────────────────────────────────────────────────

  // Teacher is a specialization of User (1:1)
  // ON DELETE RESTRICT — cannot delete user if teacher profile exists
  @OneToOne(() => User, (user) => user.teacher, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Teacher belongs to one branch
  // ON DELETE RESTRICT — cannot delete branch while teachers exist
  @ManyToOne(() => Branch, (branch) => branch.teachers, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  // One teacher can teach many groups
  @OneToMany(() => Group, (group) => group.teacher)
  groups: Group[];

  // One teacher has many salary records
  @OneToMany(() => SalaryRecord, (salary) => salary.teacher, {
    cascade: ['soft-remove'],
  })
  salaryRecords: SalaryRecord[];
}
