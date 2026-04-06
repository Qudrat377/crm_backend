import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { StudentStatus } from 'src/common/enums';

export class UpdateStudentDto {
  @ApiPropertyOptional({ description: 'F.I.Sh.' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: "O'quvchi telefoni" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: "Ota-ona F.I.Sh." })
  @IsOptional()
  @IsString()
  parentName?: string;

  @ApiPropertyOptional({ description: 'Ota-ona telefoni' })
  @IsOptional()
  @IsString()
  parentPhone?: string;

  @ApiPropertyOptional({ example: '2005-03-15', description: 'YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ description: 'Manzil' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ enum: StudentStatus, description: "O'quvchi holati" })
  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;

  @ApiPropertyOptional({ format: 'uuid', description: "Boshqa filialga ko'chirish" })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ format: 'uuid', description: "User akkauntini biriktirish yoki o'zgartirish" })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
