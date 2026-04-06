import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entity/student.entity';
import { GroupStudent } from '../groups/group-student.entity';
import { Group } from '../groups/group.entity';
import { Branch } from '../branches/branch.entity';
import { Payment } from '../payments/payment.entity';
import { Debt } from '../payments/debt.entity';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { User } from '../users/entity/user.entity';
import { UsersModule } from '../users/users.module';
import { PaymentsModule } from '../payments/payments.module';
import { BranchesModule } from '../branches/branches.module';
import { GroupsModule } from '../groups/groups.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student]),
    UsersModule,
    PaymentsModule,
    BranchesModule,
    GroupsModule,
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService, TypeOrmModule],
})
export class StudentsModule {}
