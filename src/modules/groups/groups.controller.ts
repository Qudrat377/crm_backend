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
  ApiQuery,
  ApiParam,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { CreateGroupDto, UpdateGroupDto, FilterGroupDto } from './group.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  @ApiOperation({
    summary:
      'Guruhlar ro\'yxati (filterlash, sahifalash, o\'quvchilar soni bilan)',
  })
  @ApiOkResponse({ description: 'Sahifalangan guruhlar' })
  findAll(@Query() filter: FilterGroupDto) {
    return this.groupsService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Guruh to\'liq ma\'lumotlari (o\'quvchilar ro\'yxati bilan)',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Guruh + o\'quvchilar' })
  @ApiNotFoundResponse({ description: 'Topilmadi' })
  findOne(@Param('id') id: string) {
    return this.groupsService.findById(id);
  }

  @Get(':id/attendance-summary')
  @ApiOperation({ summary: 'Guruh uchun davomat statistikasi (oy bo\'yicha)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiQuery({ name: 'month', type: Number, example: 3, description: 'Oy (1–12)' })
  @ApiQuery({ name: 'year', type: Number, example: 2026 })
  @ApiOkResponse({ description: 'Oy bo\'yicha davomat xulosasi' })
  @ApiNotFoundResponse({ description: 'Guruh topilmadi' })
  attendanceSummary(
    @Param('id') id: string,
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return this.groupsService.getAttendanceSummary(id, +month, +year);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Yangi guruh yaratish (jadval to\'qnashuvini tekshiradi)',
  })
  @ApiCreatedResponse({ description: 'Yaratilgan guruh' })
  @ApiForbiddenResponse({ description: 'Ruxsat yo\'q' })
  create(@Body() dto: CreateGroupDto) {
    return this.groupsService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Guruh ma\'lumotlarini yangilash' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Yangilangan guruh' })
  @ApiNotFoundResponse({ description: 'Topilmadi' })
  update(@Param('id') id: string, @Body() dto: UpdateGroupDto) {
    return this.groupsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Guruhni o\'chirish (faol o\'quvchilar bo\'lmasligi kerak)',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'O\'chirildi' })
  @ApiNotFoundResponse({ description: 'Topilmadi' })
  remove(@Param('id') id: string) {
    return this.groupsService.remove(id);
  }
}
