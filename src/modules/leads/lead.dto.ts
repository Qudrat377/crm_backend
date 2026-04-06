import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ActivityType, LeadSource, LeadStatus } from '../../common/enums';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateLeadDto {
  @ApiProperty({ example: 'Jasur Toshmatov', description: 'Mijoz F.I.Sh.' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '+998901234567', description: 'Aloqa telefoni' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ format: 'uuid', description: 'Filial UUID' })
  @IsUUID()
  branchId: string;

  @ApiPropertyOptional({ enum: LeadSource, default: LeadSource.OTHER })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Mas\'ul xodim (user) UUID',
  })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiPropertyOptional({ description: 'Qisqa eslatmalar / izoh' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateLeadDto {
  @ApiPropertyOptional({ description: 'F.I.Sh.' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Telefon' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: LeadSource, description: 'Manba kanali' })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @ApiPropertyOptional({
    enum: LeadStatus,
    description: 'Voronka bosqichi (pipeline)',
  })
  @IsOptional()
  @IsEnum(LeadStatus)
  pipelineStatus?: LeadStatus;

  @ApiPropertyOptional({ format: 'uuid', description: 'Mas\'ul xodim' })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiPropertyOptional({ description: 'Izohlar' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Lead o\'quvchiga aylanganda o\'quvchi UUID',
  })
  @IsOptional()
  @IsUUID()
  convertedStudentId?: string;
}

export class FilterLeadDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Ism yoki telefon bo\'yicha qidiruv',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: LeadStatus, description: 'Pipeline statusi' })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional({ enum: LeadSource })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Mas\'ul xodim bo\'yicha filter',
  })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;
}

export class CreateActivityDto {
  @ApiProperty({
    enum: ActivityType,
    description: 'Faoliyat turi (qo\'ng\'iroq, uchrashuv, ...)',
  })
  @IsEnum(ActivityType)
  activityType: ActivityType;

  @ApiProperty({
    example:
      'Ota-onasi bilan qo\'ng\'iroq qilindi, IELTS kursi haqida so\'radi',
    description: 'Batafsil matn',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
