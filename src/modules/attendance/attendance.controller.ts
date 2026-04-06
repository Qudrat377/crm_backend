import {
  Controller,
  Get,
  Post,
  Body,
  Param,
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
  ApiExtraModels,
} from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import {
  CreateAttendanceDto,
  BulkAttendanceDto,
  BulkEntry,
  FilterAttendanceDto,
} from './attendance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Attendance')
@ApiBearerAuth()
@ApiExtraModels(BulkEntry)
@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  @ApiOperation({
    summary: 'Davomat yozuvlari (filterlash va sahifalash bilan)',
  })
  @ApiOkResponse({ description: 'Sahifalangan davomat yozuvlari' })
  findAll(@Query() filter: FilterAttendanceDto) {
    return this.attendanceService.findAll(filter);
  }

  @Get('group/:groupId/date')
  @ApiOperation({ summary: 'Guruhning muayyan kun davomati ro\'yxati' })
  @ApiParam({ name: 'groupId', format: 'uuid' })
  @ApiQuery({ name: 'date', required: true, example: '2024-03-15' })
  @ApiOkResponse({ description: 'Shu kun uchun yozuvlar' })
  findByGroupAndDate(
    @Param('groupId') groupId: string,
    @Query('date') date: string,
  ) {
    return this.attendanceService.findByGroupAndDate(groupId, date);
  }

  @Get('group/:groupId/stats')
  @ApiOperation({
    summary: 'Guruh uchun davomat statistikasi (sanalar bo\'yicha)',
  })
  @ApiParam({ name: 'groupId', format: 'uuid' })
  @ApiQuery({ name: 'dateFrom', required: false, example: '2024-03-01' })
  @ApiQuery({ name: 'dateTo', required: false, example: '2024-03-31' })
  @ApiOkResponse({ description: 'Statistikalar' })
  groupStats(
    @Param('groupId') groupId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.attendanceService.getGroupStats(groupId, dateFrom, dateTo);
  }

  @Get('student/:studentId/stats')
  @ApiOperation({ summary: 'O\'quvchi uchun davomat foizi va statistikasi' })
  @ApiParam({ name: 'studentId', format: 'uuid' })
  @ApiQuery({
    name: 'groupId',
    required: false,
    description: 'Guruh UUID (ixtiyoriy filtr)',
  })
  @ApiOkResponse({ description: 'Foiz va umumiy statistika' })
  studentStats(
    @Param('studentId') studentId: string,
    @Query('groupId') groupId?: string,
  ) {
    return this.attendanceService.getStudentStats(studentId, groupId);
  }

  @Post()
  @ApiOperation({ summary: 'Bitta o\'quvchi uchun davomat belgilash (upsert)' })
  @ApiCreatedResponse({ description: 'Yaratilgan/yangilangan yozuv' })
  markOne(@Body() dto: CreateAttendanceDto, @CurrentUser() user: JwtPayload) {
    return this.attendanceService.markOne(dto, user.sub);
  }

  @Post('bulk')
  @ApiOperation({
    summary: 'Guruh bo\'yicha ommaviy davomat belgilash (bir dars uchun)',
  })
  @ApiCreatedResponse({ description: 'Ommaviy natija' })
  markBulk(@Body() dto: BulkAttendanceDto, @CurrentUser() user: JwtPayload) {
    return this.attendanceService.markBulk(dto, user.sub);
  }
}
