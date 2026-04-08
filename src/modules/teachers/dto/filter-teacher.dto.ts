import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
// import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class FilterTeacherDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Ism yoki telefon bo\'yicha qidiruv',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ description: 'true — faqat faol o\'qituvchilar' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
