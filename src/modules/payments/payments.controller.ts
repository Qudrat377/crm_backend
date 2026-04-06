import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
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
import { PaymentsService } from './payments.service';
import {
  CreatePaymentDto,
  FilterPaymentDto,
  CreateDebtDto,
  FilterDebtDto,
  CreateSalaryDto,
  FilterSalaryDto,
} from './payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ─── Payments ──────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'To\'lovlar ro\'yxati (filterlash bilan)' })
  @ApiOkResponse({ description: 'Sahifalangan to\'lovlar' })
  findAll(@Query() filter: FilterPaymentDto) {
    return this.paymentsService.findAllPayments(filter);
  }

  @Get('revenue')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Oylik daromad hisoboti (filial va yil bo\'yicha)' })
  @ApiQuery({
    name: 'branchId',
    required: true,
    description: 'Filial UUID',
  })
  @ApiQuery({ name: 'year', required: false, type: Number, example: 2026 })
  @ApiOkResponse({ description: 'Oy-oy daromad' })
  @ApiForbiddenResponse({ description: 'Faqat admin/manager' })
  revenue(
    @Query('branchId') branchId: string,
    @Query('year') year?: number,
  ) {
    const y = year ? +year : new Date().getFullYear();
    return this.paymentsService.getMonthlyRevenue(branchId, y);
  }

  @Get('student/:studentId/history')
  @ApiOperation({
    summary:
      'O\'quvchi to\'liq to\'lov tarixi (to\'lovlar + qarzlar + xulosa)',
  })
  @ApiParam({ name: 'studentId', format: 'uuid' })
  @ApiOkResponse({ description: 'Tarix va xulosa' })
  studentHistory(@Param('studentId') studentId: string) {
    return this.paymentsService.getStudentPaymentHistory(studentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'To\'lov ma\'lumotlari' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'To\'lov yozuvi' })
  @ApiNotFoundResponse({ description: 'Topilmadi' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findPaymentById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Yangi to\'lov qabul qilish (mos qarzni avtomatik yopadi)',
  })
  @ApiCreatedResponse({ description: 'Yaratilgan to\'lov' })
  create(@Body() dto: CreatePaymentDto, @CurrentUser() user: JwtPayload) {
    return this.paymentsService.createPayment(dto, user.sub);
  }

  // ─── Debts ─────────────────────────────────────────────────────

  @Get('debts/list')
  @ApiOperation({ summary: 'Qarzlar ro\'yxati (filterlash bilan)' })
  @ApiOkResponse({ description: 'Qarzlar ro\'yxati' })
  findDebts(@Query() filter: FilterDebtDto) {
    return this.paymentsService.findDebts(filter);
  }

  @Post('debts')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Yangi qarz yozuvi yaratish' })
  @ApiCreatedResponse({ description: 'Yaratilgan qarz' })
  createDebt(@Body() dto: CreateDebtDto) {
    return this.paymentsService.createDebt(dto);
  }

  @Patch('debts/:id/resolve')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Qarzni yopish (to\'langan deb belgilash)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Qarz yopildi' })
  @ApiNotFoundResponse({ description: 'Topilmadi' })
  resolveDebt(@Param('id') id: string) {
    return this.paymentsService.resolveDebt(id);
  }

  // ─── Salary Records ────────────────────────────────────────────

  @Get('salaries/list')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Maosh yozuvlari ro\'yxati' })
  @ApiOkResponse({ description: 'Sahifalangan maosh yozuvlari' })
  @ApiForbiddenResponse({ description: 'Faqat admin/manager' })
  findSalaries(@Query() filter: FilterSalaryDto) {
    return this.paymentsService.findSalaries(filter);
  }

  @Post('salaries')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'O\'qituvchi maoshini hisoblash va yozish' })
  @ApiCreatedResponse({ description: 'Yaratilgan maosh yozuvi' })
  createSalary(@Body() dto: CreateSalaryDto, @CurrentUser() user: JwtPayload) {
    return this.paymentsService.createSalary(dto, user.sub);
  }

  @Patch('salaries/:id/pay')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Maoshni to\'langan deb belgilash' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'To\'langan deb belgilandi' })
  @ApiNotFoundResponse({ description: 'Topilmadi' })
  markSalaryPaid(@Param('id') id: string) {
    return this.paymentsService.markSalaryPaid(id);
  }
}
