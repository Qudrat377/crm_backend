import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { AttendanceStatus } from '../../common/enums';
import { Group } from '../groups/group.entity';
import { Student } from '../students/entity/student.entity';
import { User } from '../users/entity/user.entity';

@Entity('attendance')
@Unique(['groupId', 'studentId', 'lessonDate']) // one record per student per lesson day
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'lesson_date', type: 'date' })
  lessonDate: Date;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  status: AttendanceStatus;

  @Column({ type: 'text', nullable: true })
  note: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  // ─── Foreign keys ─────────────────────────────────────────────

  @Column({ name: 'group_id' })
  groupId: string;

  @Column({ name: 'student_id' })
  studentId: string;

  @Column({ name: 'marked_by_id' })
  markedById: string;

  // ─── Relations ────────────────────────────────────────────────

  // ON DELETE CASCADE — if group is deleted, remove all its attendance records
  @ManyToOne(() => Group, (group) => group.attendances, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  // ON DELETE CASCADE — if student is hard-deleted, remove attendance
  @ManyToOne(() => Student, (student) => student.attendances, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  // ON DELETE RESTRICT — keep record of who marked attendance
  @ManyToOne(() => User, (user) => user.markedAttendances, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'marked_by_id' })
  markedBy: User;
}
