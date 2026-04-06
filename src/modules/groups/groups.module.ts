import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './group.entity';
import { GroupStudent } from './group-student.entity';
import { Teacher } from '../teachers/entity/teacher.entity';
import { Course } from '../courses/course.entity';
import { Branch } from '../branches/branch.entity';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { BranchesModule } from '../branches/branches.module';

@Module({
  imports: [TypeOrmModule.forFeature([Group, GroupStudent, Teacher, Course]),
  BranchesModule
],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService, TypeOrmModule],
})
export class GroupsModule {}
