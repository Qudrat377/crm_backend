import {
  Controller,
  Get,
  Post,
  Patch,
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
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import {
  CreateLeadDto,
  UpdateLeadDto,
  FilterLeadDto,
  CreateActivityDto,
} from './lead.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Leads (CRM Pipeline)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @ApiOperation({
    summary:
      'Leadlar ro\'yxati (pipeline, manba, filial bo\'yicha filterlash)',
  })
  @ApiOkResponse({ description: 'Sahifalangan leadlar' })
  findAll(@Query() filter: FilterLeadDto) {
    return this.leadsService.findAll(filter);
  }

  @Get('pipeline-summary')
  @ApiOperation({
    summary:
      'CRM voronka: har bir status bo\'yicha son, manbalar, konversiya foizi',
  })
  @ApiQuery({ name: 'branchId', required: false, description: 'Filial UUID' })
  @ApiOkResponse({ description: 'Voronka xulosasi' })
  pipelineSummary(@Query('branchId') branchId?: string) {
    return this.leadsService.getPipelineSummary(branchId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lead to\'liq ma\'lumotlari (barcha faoliyat tarixi bilan)',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Lead + faoliyatlar' })
  @ApiNotFoundResponse({ description: 'Topilmadi' })
  findOne(@Param('id') id: string) {
    return this.leadsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Yangi lead qo\'shish' })
  @ApiCreatedResponse({ description: 'Yaratilgan lead' })
  create(@Body() dto: CreateLeadDto) {
    return this.leadsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary:
      'Lead holatini yangilash / pipelineda oldinga siljitish (status o\'zgarishi avtomatik log qilinadi)',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Yangilangan lead' })
  @ApiNotFoundResponse({ description: 'Topilmadi' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLeadDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.leadsService.update(id, dto, user.sub);
  }

  @Post(':id/activities')
  @ApiOperation({
    summary:
      'Lead uchun faoliyat yozuvi qo\'shish (qo\'ng\'iroq, xabar, uchrashuv va h.k.)',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiCreatedResponse({ description: 'Qo\'shilgan faoliyat' })
  @ApiNotFoundResponse({ description: 'Lead topilmadi' })
  addActivity(
    @Param('id') id: string,
    @Body() dto: CreateActivityDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.leadsService.addActivity(id, dto, user.sub);
  }
}
