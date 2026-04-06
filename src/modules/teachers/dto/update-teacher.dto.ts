import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTeacherDto {
  @ApiPropertyOptional({ format: 'uuid', description: 'Filial' })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ description: 'F.I.Sh.' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Telefon' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Mutaxassislik / fanlar' })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({ description: 'Oylik maosh (so\'m)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  monthlySalary?: number;

  @ApiPropertyOptional({ description: 'Profil faolligi' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}