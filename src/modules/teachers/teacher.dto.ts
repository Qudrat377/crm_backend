// import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
// import {
//   IsBoolean,
//   IsDateString,
//   IsNotEmpty,
//   IsNumber,
//   IsOptional,
//   IsPositive,
//   IsString,
//   IsUUID,
// } from 'class-validator';
// import { Type } from 'class-transformer';
// import { PaginationDto } from '../../common/dto/pagination.dto';

// export class CreateTeacherDto {
//   @ApiProperty({
//     format: 'uuid',
//     description: 'Bog\'liq user account ID (rol: teacher bo\'lishi kerak)',
//     example: '550e8400-e29b-41d4-a716-446655440000',
//   })
//   @IsUUID()
//   userId: string;

//   @ApiProperty({ format: 'uuid', description: 'Filial UUID' })
//   @IsUUID()
//   branchId: string;

//   @ApiProperty({ example: 'Dilnoza Yusupova' })
//   @IsString()
//   @IsNotEmpty()
//   fullName: string;

//   @ApiPropertyOptional({ example: '+998901111111' })
//   @IsOptional()
//   @IsString()
//   phone?: string;

//   @ApiPropertyOptional({ example: 'Ingliz tili, IELTS' })
//   @IsOptional()
//   @IsString()
//   specialization?: string;

//   @ApiPropertyOptional({ example: 3000000, description: 'Oylik maosh (so\'m)' })
//   @IsOptional()
//   @Type(() => Number)
//   @IsNumber()
//   @IsPositive()
//   monthlySalary?: number;

//   @ApiPropertyOptional({ example: '2024-01-01' })
//   @IsOptional()
//   @IsDateString()
//   hiredAt?: string;
// }

// export class UpdateTeacherDto {
//   @ApiPropertyOptional({ format: 'uuid', description: 'Filial' })
//   @IsOptional()
//   @IsUUID()
//   branchId?: string;

//   @ApiPropertyOptional({ description: 'F.I.Sh.' })
//   @IsOptional()
//   @IsString()
//   fullName?: string;

//   @ApiPropertyOptional({ description: 'Telefon' })
//   @IsOptional()
//   @IsString()
//   phone?: string;

//   @ApiPropertyOptional({ description: 'Mutaxassislik / fanlar' })
//   @IsOptional()
//   @IsString()
//   specialization?: string;

//   @ApiPropertyOptional({ description: 'Oylik maosh (so\'m)' })
//   @IsOptional()
//   @Type(() => Number)
//   @IsNumber()
//   @IsPositive()
//   monthlySalary?: number;

//   @ApiPropertyOptional({ description: 'Profil faolligi' })
//   @IsOptional()
//   @IsBoolean()
//   isActive?: boolean;
// }

// export class FilterTeacherDto extends PaginationDto {
//   @ApiPropertyOptional({
//     description: 'Ism yoki telefon bo\'yicha qidiruv',
//   })
//   @IsOptional()
//   @IsString()
//   search?: string;

//   @ApiPropertyOptional({ format: 'uuid' })
//   @IsOptional()
//   @IsUUID()
//   branchId?: string;

//   @ApiPropertyOptional({ description: 'true — faqat faol o\'qituvchilar' })
//   @IsOptional()
//   @Type(() => Boolean)
//   @IsBoolean()
//   isActive?: boolean;
// }
