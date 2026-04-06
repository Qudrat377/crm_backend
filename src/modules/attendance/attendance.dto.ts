import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '../../common/enums';
import { PaginationDto } from '../../common/dto/pagination.dto';

// ─── Single entry ─────────────────────────────────────────────────

export class CreateAttendanceDto {
  @ApiProperty({ format: 'uuid', description: 'Guruh UUID' })
  @IsUUID()
  groupId: string;

  @ApiProperty({ format: 'uuid', description: 'O\'quvchi UUID' })
  @IsUUID()
  studentId: string;

  @ApiProperty({ example: '2024-03-15', description: 'YYYY-MM-DD' })
  @IsDateString({}, { message: 'Sana YYYY-MM-DD formatida bo\'lishi kerak' })
  lessonDate: string;

  @ApiPropertyOptional({ enum: AttendanceStatus, default: AttendanceStatus.PRESENT })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @ApiPropertyOptional({ example: 'Kasalligi sababli' })
  @IsOptional()
  @IsString()
  note?: string;
}

// ─── Bulk entry (one lesson, many students) ───────────────────────

/** Bitta dars uchun o\'quvchi qatori (ommaviy davomat) */
export class BulkEntry {
  @ApiProperty({ format: 'uuid', description: 'O\'quvchi UUID' })
  @IsUUID()
  studentId: string;

  @ApiPropertyOptional({
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
    description: 'Davomat holati',
  })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @ApiPropertyOptional({ description: 'Izoh (sabab va h.k.)' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class BulkAttendanceDto {
  @ApiProperty({
    format: 'uuid',
    description: 'Guruh UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  groupId: string;

  @ApiProperty({
    example: '2024-03-15',
    description: 'Dars sanasi YYYY-MM-DD',
  })
  @IsDateString()
  lessonDate: string;

  @ApiProperty({
    type: [BulkEntry],
    description: 'Shu kungi barcha o\'quvchilar uchun qatorlar',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkEntry)
  entries: BulkEntry[];
}

// ─── Filter ───────────────────────────────────────────────────────

export class FilterAttendanceDto extends PaginationDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  groupId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({ enum: AttendanceStatus })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @ApiPropertyOptional({
    example: '2024-03-01',
    description: 'Oraliq boshlanishi (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    example: '2024-03-31',
    description: 'Oraliq tugashi (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
