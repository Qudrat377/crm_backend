import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Matches,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GroupStatus } from '../../common/enums';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateGroupDto {
  @ApiProperty({ example: 'IELTS Ertalabki A' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ format: 'uuid', description: 'Kurs UUID' })
  @IsUUID()
  courseId: string;

  @ApiProperty({ format: 'uuid', description: 'O\'qituvchi profili UUID' })
  @IsUUID()
  teacherId: string;

  @ApiProperty({ format: 'uuid', description: 'Filial UUID' })
  @IsUUID()
  branchId: string;

  @ApiProperty({ example: 'Mon,Wed,Fri', description: 'Vergul bilan ajratilgan kunlar' })
  @IsString()
  @IsNotEmpty()
  scheduleDays: string;

  @ApiProperty({ example: '09:00', description: 'HH:MM format' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime HH:MM formatida bo\'lishi kerak' })
  startTime: string;

  @ApiProperty({ example: '11:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'endTime HH:MM formatida bo\'lishi kerak' })
  endTime: string;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  maxStudents?: number;

  @ApiPropertyOptional({ enum: GroupStatus, default: GroupStatus.UPCOMING })
  @IsOptional()
  @IsEnum(GroupStatus)
  status?: GroupStatus;

  @ApiPropertyOptional({ example: '2024-02-01' })
  @IsOptional()
  @IsDateString()
  startedAt?: string;
}

export class UpdateGroupDto {
  @ApiPropertyOptional({ description: 'Guruh nomi' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Boshqa o\'qituvchiga o\'tkazish' })
  @IsOptional()
  @IsUUID()
  teacherId?: string;

  @ApiPropertyOptional({
    example: 'Mon,Wed,Fri',
    description: 'Dars kunlari (vergul bilan)',
  })
  @IsOptional()
  @IsString()
  scheduleDays?: string;

  @ApiPropertyOptional({ example: '09:00', description: 'Boshlanish vaqti HH:MM' })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  startTime?: string;

  @ApiPropertyOptional({ example: '11:00', description: 'Tugash vaqti HH:MM' })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  endTime?: string;

  @ApiPropertyOptional({ description: 'Maksimal o\'quvchilar soni' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  maxStudents?: number;

  @ApiPropertyOptional({ enum: GroupStatus, description: 'Guruh holati' })
  @IsOptional()
  @IsEnum(GroupStatus)
  status?: GroupStatus;
}

export class FilterGroupDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Guruh nomi bo\'yicha qidiruv' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: GroupStatus })
  @IsOptional()
  @IsEnum(GroupStatus)
  status?: GroupStatus;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  teacherId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  courseId?: string;
}
