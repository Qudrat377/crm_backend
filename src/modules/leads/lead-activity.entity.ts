import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ActivityType } from '../../common/enums';
import { Lead } from './lead.entity';
import { User } from '../users/entity/user.entity';

@Entity('lead_activities')
export class LeadActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'activity_type',
    type: 'enum',
    enum: ActivityType,
  })
  activityType: ActivityType;

  @Column({ type: 'text' })
  description: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  // ─── Foreign keys ─────────────────────────────────────────────

  @Column({ name: 'lead_id' })
  leadId: string;

  @Column({ name: 'created_by_id' })
  createdById: string;

  // ─── Relations ────────────────────────────────────────────────

  // ON DELETE CASCADE — if lead is deleted, delete all its activities
  @ManyToOne(() => Lead, (lead) => lead.activities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;

  // ON DELETE RESTRICT — keep record of who created the activity
  @ManyToOne(() => User, (user) => user.leadActivities, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;
}
