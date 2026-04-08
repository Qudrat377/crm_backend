// import { PaginationDto } from '@/common/dto/pagination.dto';
// import { StudentStatus } from '@/common/enums';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { StudentStatus } from 'src/common/enums';

export class FilterStudentDto extends PaginationDto {
  @ApiPropertyOptional({ description: "Ism, telefon yoki ota-ona ismi bo'yicha qidirish" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: StudentStatus })
  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;

  @ApiPropertyOptional({ format: 'uuid', description: 'Filial bo\'yicha filter' })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Guruh ID bo\'yicha filterlash',
  })
  @IsOptional()
  @IsUUID()
  groupId?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'User ID bo\'yicha filterlash' })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
