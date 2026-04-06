import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCourseDto {
  @ApiProperty({ example: 'IELTS tayyorlov kursi', description: 'Kurs nomi' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Kurs tavsifi' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 600000, description: 'Oylik to\'lov (so\'m)' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  pricePerMonth: number;

  @ApiPropertyOptional({ example: 6, description: 'Rejalashtirilgan davomiylik (oy)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationMonths?: number;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Filial UUID',
    format: 'uuid',
  })
  @IsUUID()
  branchId: string;
}

export class UpdateCourseDto {
  @ApiPropertyOptional({ description: 'Kurs nomi' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Kurs tavsifi' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Oylik to\'lov (so\'m)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  pricePerMonth?: number;

  @ApiPropertyOptional({ description: 'Davomiyligi (oy)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationMonths?: number;

  @ApiPropertyOptional({ description: 'Kurs katalogda ko\'rinishi uchun faol' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
