import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { Teacher } from '../teachers/entity/teacher.entity';
import { Student } from '../students/entity/student.entity';
import { Course } from '../courses/course.entity';
import { Group } from '../groups/group.entity';
import { Lead } from '../leads/lead.entity';

@Entity('branches')
export class Branch extends BaseEntity {
  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  // ─── Relations ────────────────────────────────────────────────

  @OneToMany(() => Teacher, (teacher) => teacher.branch)
  teachers: Teacher[];

  @OneToMany(() => Student, (student) => student.branch)
  students: Student[];

  @OneToMany(() => Course, (course) => course.branch)
  courses: Course[];

  @OneToMany(() => Group, (group) => group.branch)
  groups: Group[];

  @OneToMany(() => Lead, (lead) => lead.branch)
  leads: Lead[];
}
