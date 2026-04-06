import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { Branch } from '../branches/branch.entity';
import { Group } from '../groups/group.entity';

@Entity('courses')
export class Course extends BaseEntity {
  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    name: 'price_per_month',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  pricePerMonth: number;

  @Column({ name: 'duration_months', default: 1 })
  durationMonths: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // ─── Foreign key ──────────────────────────────────────────────

  @Column({ name: 'branch_id' })
  branchId: string;

  // ─── Relations ────────────────────────────────────────────────

  @ManyToOne(() => Branch, (branch) => branch.courses, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  // One course can have many groups
  @OneToMany(() => Group, (group) => group.course)
  groups: Group[];
}
