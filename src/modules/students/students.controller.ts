import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { StudentsService } from './students.service';
// import { CreateStudentDto, UpdateStudentDto, FilterStudentDto } from './student.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { FilterStudentDto } from './dto/filter-student.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @ApiOperation({
    summary: 'O\'quvchilar ro\'yxati (filterlash va sahifalash bilan)',
  })
  @ApiOkResponse({ description: 'Sahifalangan o\'quvchilar' })
  findAll(@Query() filter: FilterStudentDto) {
    return this.studentsService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({
    summary:
      'O\'quvchi to\'liq ma\'lumotlari (to\'lovlar, qarzlar, guruhlar)',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'O\'quvchi + bog\'liq ma\'lumotlar' })
  @ApiNotFoundResponse({ description: 'Topilmadi' })
  findOne(@Param('id') id: string) {
    return this.studentsService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Yangi o\'quvchi qo\'shish' })
  @ApiCreatedResponse({ description: 'Yaratilgan o\'quvchi' })
  @ApiForbiddenResponse({ description: 'Ruxsat yo\'q' })
  create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'O\'quvchi ma\'lumotlarini yangilash' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Yangilangan o\'quvchi' })
  @ApiNotFoundResponse({ description: 'Topilmadi' })
  update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'O\'quvchini soft-delete qilish (guruhlardan ham chiqariladi)',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'O\'chirildi' })
  @ApiNotFoundResponse({ description: 'Topilmadi' })
  remove(@Param('id') id: string) {
    return this.studentsService.softDelete(id);
  }

  @Post(':id/groups/:groupId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'O\'quvchini guruhga qo\'shish' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'O\'quvchi UUID' })
  @ApiParam({ name: 'groupId', format: 'uuid', description: 'Guruh UUID' })
  @ApiOkResponse({ description: 'Guruhga biriktirildi' })
  assignToGroup(
    @Param('id') id: string,
    @Param('groupId') groupId: string,
  ) {
    return this.studentsService.assignToGroup(id, groupId);
  }

  @Delete(':id/groups/:groupId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'O\'quvchini guruhdan chiqarish' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiParam({ name: 'groupId', format: 'uuid' })
  @ApiOkResponse({ description: 'Guruhdan chiqarildi' })
  removeFromGroup(
    @Param('id') id: string,
    @Param('groupId') groupId: string,
  ) {
    return this.studentsService.removeFromGroup(id, groupId);
  }
}
