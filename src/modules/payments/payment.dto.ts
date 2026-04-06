import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod, PaymentStatus, SalaryStatus } from '../../common/enums';
import { PaginationDto } from '../../common/dto/pagination.dto';

// ─── Payment DTOs ─────────────────────────────────────────────────

export class CreatePaymentDto {
  @ApiProperty({ format: 'uuid', description: 'O\'quvchi UUID' })
  @IsUUID()
  studentId: string;

  @ApiProperty({ format: 'uuid', description: 'Guruh UUID' })
  @IsUUID()
  groupId: string;

  @ApiProperty({ example: 600000, description: 'To\'lov miqdori (so\'m)' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({ example: 50000, description: 'Chegirma miqdori' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiProperty({ example: 3, description: '1-12 oralig\'ida' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  paymentMonth: number;

  @ApiProperty({ example: 2024 })
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  paymentYear: number;

  @ApiPropertyOptional({ enum: PaymentMethod, default: PaymentMethod.CASH })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @ApiPropertyOptional({ enum: PaymentStatus, default: PaymentStatus.PAID })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({ example: 'Naqd pul' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class FilterPaymentDto extends PaginationDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  groupId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ description: 'Oy (1–12)', example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @ApiPropertyOptional({ description: 'Yil', example: 2026 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
}

// ─── Debt DTOs ────────────────────────────────────────────────────

export class CreateDebtDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  studentId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  groupId: string;

  @ApiProperty({ example: 600000, description: 'Qarz miqdori (so\'m)' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 3, description: 'Qarz oyi (1–12)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  debtMonth: number;

  @ApiProperty({ example: 2026, description: 'Qarz yili' })
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  debtYear: number;
}

export class FilterDebtDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  groupId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({
    default: false,
    description: 'true — faqat yopilgan qarzlar',
  })
  @IsOptional()
  @Type(() => Boolean)
  isResolved?: boolean;
}

// ─── Salary DTOs ──────────────────────────────────────────────────

export class CreateSalaryDto {
  @ApiProperty({ format: 'uuid', description: 'O\'qituvchi profili UUID' })
  @IsUUID()
  teacherId: string;

  @ApiProperty({ example: 3000000, description: 'Asosiy maosh' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  baseAmount: number;

  @ApiPropertyOptional({ example: 500000, description: 'Bonus' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bonus?: number;

  @ApiPropertyOptional({ example: 100000, description: 'Ushlab qolish' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  deduction?: number;

  @ApiProperty({ example: 3, description: 'Hisoblangan oy (1–12)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  salaryMonth: number;

  @ApiProperty({ example: 2026, description: 'Yil' })
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  salaryYear: number;
}

export class FilterSalaryDto extends PaginationDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  teacherId?: string;

  @ApiPropertyOptional({ enum: SalaryStatus })
  @IsOptional()
  @IsEnum(SalaryStatus)
  status?: SalaryStatus;

  @ApiPropertyOptional({ description: 'Filter yil bo\'yicha', example: 2026 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;
}
