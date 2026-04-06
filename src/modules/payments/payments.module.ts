import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { Debt } from './debt.entity';
import { SalaryRecord } from './salary-record.entity';
import { GroupStudent } from '../groups/group-student.entity';
import { Teacher } from '../teachers/entity/teacher.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Debt, SalaryRecord, GroupStudent, Teacher]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService, TypeOrmModule],
})
export class PaymentsModule {}
