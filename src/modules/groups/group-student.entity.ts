import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Group } from './group.entity';
import { Student } from '../students/entity/student.entity';

@Entity('group_students')
@Unique(['groupId', 'studentId']) // one enrollment per student per group
export class GroupStudent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'group_id' })
  groupId: string;

  @Column({ name: 'student_id' })
  studentId: string;

  @CreateDateColumn({ name: 'enrolled_at', type: 'date' })
  enrolledAt: Date;

  @Column({ name: 'left_at', type: 'date', nullable: true })
  leftAt: Date | null;

  // true = currently enrolled, false = left
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // ─── Relations ────────────────────────────────────────────────

  // ON DELETE CASCADE — if a group is deleted, remove all its enrollments
  @ManyToOne(() => Group, (group) => group.groupStudents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  // ON DELETE CASCADE — if a student is hard-deleted, remove enrollments
  @ManyToOne(() => Student, (student) => student.groupStudents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: Student;
}
