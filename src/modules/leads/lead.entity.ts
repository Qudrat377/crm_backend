import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LeadStatus, LeadSource } from '../../common/enums';
import { Branch } from '../branches/branch.entity';
import { User } from '../users/entity/user.entity';
import { Student } from '../students/entity/student.entity';
import { LeadActivity } from './lead-activity.entity';

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name', length: 255 })
  fullName: string;

  @Column({ length: 50 })
  phone: string;

  @Column({
    type: 'enum',
    enum: LeadSource,
    default: LeadSource.OTHER,
  })
  source: LeadSource;

  @Column({
    name: 'pipeline_status',
    type: 'enum',
    enum: LeadStatus,
    default: LeadStatus.NEW,
  })
  pipelineStatus: LeadStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // ─── Foreign keys ─────────────────────────────────────────────

  @Column({ name: 'branch_id' })
  branchId: string;

  @Column({ name: 'assigned_to_id', nullable: true })
  assignedToId: string | null;

  // When lead converts to a student, we link the student here
  @Column({ name: 'converted_student_id', nullable: true })
  convertedStudentId: string | null;

  // ─── Relations ────────────────────────────────────────────────

  @ManyToOne(() => Branch, (branch) => branch.leads, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  // SET NULL — if the assigned user is deleted, keep the lead but clear assignment
  @ManyToOne(() => User, (user) => user.assignedLeads, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo: User | null;

  // SET NULL — if the converted student is deleted, keep the lead record
  @ManyToOne(() => Student, (student) => student.convertedFromLeads, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'converted_student_id' })
  convertedStudent: Student | null;

  // CASCADE — when a lead is deleted, also delete all its activity logs
  @OneToMany(() => LeadActivity, (activity) => activity.lead, {
    cascade: true,
  })
  activities: LeadActivity[];
}
