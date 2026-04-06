import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from './lead.entity';
import { LeadActivity } from './lead-activity.entity';
import { Branch } from '../branches/branch.entity';
import { User } from '../users/entity/user.entity';
import { Student } from '../students/entity/student.entity';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';

@Module({
  imports: [TypeOrmModule.forFeature([Lead, LeadActivity, Branch, User, Student])],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}
