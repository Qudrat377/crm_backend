import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { GroupStatus } from '../../common/enums';
import { Course } from '../courses/course.entity';
import { Teacher } from '../teachers/entity/teacher.entity';
import { Branch } from '../branches/branch.entity';
import { GroupStudent } from './group-student.entity';
import { Payment } from '../payments/payment.entity';
import { Debt } from '../payments/debt.entity';
import { Attendance } from '../attendance/attendance.entity';

@Entity('groups')
export class Group extends BaseEntity {
  @Column({ length: 255 })
  name: string;

  // Days stored as comma-separated string: "Mon,Wed,Fri"
  @Column({ name: 'schedule_days', length: 100 })
  scheduleDays: string;

  // HH:MM format: "09:00"
  @Column({ name: 'start_time', length: 10 })
  startTime: string;

  @Column({ name: 'end_time', length: 10 })
  endTime: string;

  @Column({ name: 'max_students', default: 20 })
  maxStudents: number;

  @Column({
    type: 'enum',
    enum: GroupStatus,
    default: GroupStatus.UPCOMING,
  })
  status: GroupStatus;

  @Column({ name: 'started_at', type: 'date', default: () => 'CURRENT_DATE' })
  startedAt: Date;

  // ─── Foreign keys ─────────────────────────────────────────────

  @Column({ name: 'course_id' })
  courseId: string;

  @Column({ name: 'teacher_id' })
  teacherId: string;

  @Column({ name: 'branch_id' })
  branchId: string;

  // ─── Relations ────────────────────────────────────────────────

  // ON DELETE RESTRICT — cannot delete course if groups are using it
  @ManyToOne(() => Course, (course) => course.groups, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  // ON DELETE RESTRICT — cannot delete teacher if groups are assigned
  @ManyToOne(() => Teacher, (teacher) => teacher.groups, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  // ON DELETE RESTRICT — cannot delete branch while groups exist
  @ManyToOne(() => Branch, (branch) => branch.groups, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  // When a group is deleted, cascade remove all enrollments
  @OneToMany(() => GroupStudent, (gs) => gs.group, {
    cascade: true,
  })
  groupStudents: GroupStudent[];

  // Payments related to this group
  @OneToMany(() => Payment, (payment) => payment.group)
  payments: Payment[];

  // Debt records related to this group
  @OneToMany(() => Debt, (debt) => debt.group)
  debts: Debt[];

  // Attendance records for lessons in this group
  // CASCADE — when group is deleted, attendance records are also deleted
  @OneToMany(() => Attendance, (attendance) => attendance.group, {
    cascade: true,
  })
  attendances: Attendance[];
}
