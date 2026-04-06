import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBranchDto {
  @ApiProperty({ example: 'Chilonzor filiali' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Toshkent, Chilonzor tumani' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '+998712345678' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class UpdateBranchDto {
  @ApiPropertyOptional({ example: 'Yangi nom filial', description: 'Filial nomi' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Manzil' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '+998712345678', description: 'Aloqa telefoni' })
  @IsOptional()
  @IsString()
  phone?: string;
}
