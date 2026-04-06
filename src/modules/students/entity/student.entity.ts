import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne, // Qo'shildi
  JoinColumn,
} from 'typeorm';
import { SoftDeleteBaseEntity } from '../../../database/base.entity';
import { StudentStatus } from '../../../common/enums';
import { Branch } from '../../branches/branch.entity';
import { GroupStudent } from '../../groups/group-student.entity';
import { Payment } from '../../payments/payment.entity';
import { Debt } from '../../payments/debt.entity';
import { Attendance } from '../../attendance/attendance.entity';
import { Lead } from '../../leads/lead.entity';
import { User } from '../../users/entity/user.entity';

@Entity('students')
export class Student extends SoftDeleteBaseEntity {
  @Column({ name: 'full_name', length: 255 })
  fullName: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ name: 'parent_name', length: 255, nullable: true })
  parentName: string;

  @Column({ name: 'parent_phone', length: 50, nullable: true })
  parentPhone: string;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: Date;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({
    type: 'enum',
    enum: StudentStatus,
    default: StudentStatus.ACTIVE,
  })
  status: StudentStatus;

  // ─── Foreign keys ──────────────────────────────────────────────

  @Column({ name: 'branch_id' })
  branchId: string;

  // Tizimga kirish uchun User ID (nullable chunki hamma studentda account bo'lmasligi mumkin)
  @Column({ name: 'user_id', nullable: true, unique: true })
  userId: string | null;

  // ─── Relations ────────────────────────────────────────────────

  // User bilan 1:1 bog'liqlik
  @OneToOne(() => User, (user) => user.student, {
    onDelete: 'SET NULL', // User o'chirilsa, student ma'lumotlari qoladi, faqat user_id null bo'ladi
    nullable: true,
  })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  // Student belongs to one branch
  @ManyToOne(() => Branch, (branch) => branch.students, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  // M:N with Group through GroupStudent junction
  @OneToMany(() => GroupStudent, (gs) => gs.student, {
    cascade: true,
  })
  groupStudents: GroupStudent[];

  // Payments made by this student
  @OneToMany(() => Payment, (payment) => payment.student)
  payments: Payment[];

  // Debt records for this student
  @OneToMany(() => Debt, (debt) => debt.student)
  debts: Debt[];

  // Attendance records
  @OneToMany(() => Attendance, (attendance) => attendance.student, {
    cascade: ['soft-remove'],
  })
  attendances: Attendance[];

  // If this student was converted from a lead
  @OneToMany(() => Lead, (lead) => lead.convertedStudent)
  convertedFromLeads: Lead[];
}

// import {
//   Entity,
//   Column,
//   ManyToOne,
//   OneToMany,
//   JoinColumn,
// } from 'typeorm';
// import { SoftDeleteBaseEntity } from '../../database/base.entity';
// import { StudentStatus } from '../../common/enums';
// import { Branch } from '../branches/branch.entity';
// import { GroupStudent } from '../groups/group-student.entity';
// import { Payment } from '../payments/payment.entity';
// import { Debt } from '../payments/debt.entity';
// import { Attendance } from '../attendance/attendance.entity';
// import { Lead } from '../leads/lead.entity';

// @Entity('students')
// export class Student extends SoftDeleteBaseEntity {
//   @Column({ name: 'full_name', length: 255 })
//   fullName: string;

//   @Column({ length: 50, nullable: true })
//   phone: string;

//   @Column({ name: 'parent_name', length: 255, nullable: true })
//   parentName: string;

//   @Column({ name: 'parent_phone', length: 50, nullable: true })
//   parentPhone: string;

//   @Column({ name: 'birth_date', type: 'date', nullable: true })
//   birthDate: Date;

//   @Column({ type: 'text', nullable: true })
//   address: string;

//   @Column({
//     type: 'enum',
//     enum: StudentStatus,
//     default: StudentStatus.ACTIVE,
//   })
//   status: StudentStatus;

//   // ─── Foreign key ──────────────────────────────────────────────

//   @Column({ name: 'branch_id' })
//   branchId: string;

//   // ─── Relations ────────────────────────────────────────────────

//   // Student belongs to one branch
//   // ON DELETE RESTRICT — cannot remove branch while students exist
//   @ManyToOne(() => Branch, (branch) => branch.students, {
//     onDelete: 'RESTRICT',
//   })
//   @JoinColumn({ name: 'branch_id' })
//   branch: Branch;

//   // M:N with Group through GroupStudent junction
//   // CASCADE — when student is soft-deleted, GroupStudent records are also removed
//   @OneToMany(() => GroupStudent, (gs) => gs.student, {
//     cascade: true,
//   })
//   groupStudents: GroupStudent[];

//   // Payments made by this student
//   // ON DELETE RESTRICT — keep payment history even if student is deactivated
//   @OneToMany(() => Payment, (payment) => payment.student)
//   payments: Payment[];

//   // Debt records for this student
//   @OneToMany(() => Debt, (debt) => debt.student)
//   debts: Debt[];

//   // Attendance records
//   // CASCADE — when student hard-deleted, remove attendance (but we use soft-delete)
//   @OneToMany(() => Attendance, (attendance) => attendance.student, {
//     cascade: ['soft-remove'],
//   })
//   attendances: Attendance[];

//   // If this student was converted from a lead
//   @OneToMany(() => Lead, (lead) => lead.convertedStudent)
//   convertedFromLeads: Lead[];
// }
