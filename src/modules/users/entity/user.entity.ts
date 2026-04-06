import { Entity, Column, OneToOne, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '../../../database/base.entity';
import { UserRole } from '../../../common/enums';
import { Teacher } from '../../teachers/entity/teacher.entity';
import { Payment } from '../../payments/payment.entity';
import { Attendance } from '../../attendance/attendance.entity';
import { SalaryRecord } from '../../payments/salary-record.entity';
import { Lead } from '../../leads/lead.entity';
import { LeadActivity } from '../../leads/lead-activity.entity';
import { Student } from '../../students/entity/student.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'password_hash' })
  @Exclude() // Response yuborilganda parolni yashirish uchun
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.TEACHER })
  role: UserRole;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  @Exclude()
  refreshToken: string | null;

  // ─── Relations ────────────────────────────────────────────────

  // User student bo'lishi mumkin (Ixtiyoriy 1:1)
  @OneToOne(() => Student, (student) => student.user)
  student: Student;

  // One user can have one teacher profile
  @OneToOne(() => Teacher, (teacher) => teacher.user)
  teacher: Teacher;

  // Payments recorded by this user (admin/manager)
  @OneToMany(() => Payment, (payment) => payment.recordedBy)
  recordedPayments: Payment[];

  // Attendance records marked by this user
  @OneToMany(() => Attendance, (attendance) => attendance.markedBy)
  markedAttendances: Attendance[];

  // Salary records processed by this user
  @OneToMany(() => SalaryRecord, (salary) => salary.processedBy)
  processedSalaries: SalaryRecord[];

  // Leads assigned to this user
  @OneToMany(() => Lead, (lead) => lead.assignedTo)
  assignedLeads: Lead[];

  // Lead activities created by this user
  @OneToMany(() => LeadActivity, (activity) => activity.createdBy)
  leadActivities: LeadActivity[];
}

// import { Entity, Column, OneToOne, OneToMany } from 'typeorm';
// import { Exclude } from 'class-transformer';
// import { BaseEntity } from '../../database/base.entity';
// import { UserRole } from '../../common/enums';
// import { Teacher } from '../teachers/teacher.entity';
// import { Payment } from '../payments/payment.entity';
// import { Attendance } from '../attendance/attendance.entity';
// import { SalaryRecord } from '../payments/salary-record.entity';
// import { Lead } from '../leads/lead.entity';
// import { LeadActivity } from '../leads/lead-activity.entity';

// @Entity('users')
// export class User extends BaseEntity {
//   @Column({ unique: true, length: 255 })
//   email: string;

//   @Column({ name: 'password_hash' })
//   // @Exclude() // never expose in responses
//   passwordHash: string;

//   @Column({ type: 'enum', enum: UserRole, default: UserRole.TEACHER })
//   role: UserRole;

//   @Column({ name: 'is_active', default: true })
//   isActive: boolean;

//   @Column({ name: 'refresh_token', type: 'text', nullable: true })
//   @Exclude()
//   refreshToken: string | null;

//   // ─── Relations ────────────────────────────────────────────────

//   // One user can have one teacher profile
//   @OneToOne(() => Teacher, (teacher) => teacher.user)
//   teacher: Teacher;

//   // Payments recorded by this user (admin/manager)
//   @OneToMany(() => Payment, (payment) => payment.recordedBy)
//   recordedPayments: Payment[];

//   // Attendance records marked by this user
//   @OneToMany(() => Attendance, (attendance) => attendance.markedBy)
//   markedAttendances: Attendance[];

//   // Salary records processed by this user
//   @OneToMany(() => SalaryRecord, (salary) => salary.processedBy)
//   processedSalaries: SalaryRecord[];

//   // Leads assigned to this user
//   @OneToMany(() => Lead, (lead) => lead.assignedTo)
//   assignedLeads: Lead[];

//   // Lead activities created by this user
//   @OneToMany(() => LeadActivity, (activity) => activity.createdBy)
//   leadActivities: LeadActivity[];
// }
