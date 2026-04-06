import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { UserRole } from "../enums";

export class PaginationDto {
  @ApiPropertyOptional({
    default: 1,
    minimum: 1,
    description: "Sahifa raqami (1 dan boshlanadi)",
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    default: 20,
    minimum: 1,
    maximum: 100,
    description: "Bir sahifadagi yozuvlar soni (max 100)",
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  // src/common/dto/pagination.dto.ts
  @ApiPropertyOptional({
    description: "Qidiruv kalit soʻzi (email yoki ism boʻyicha)",
    example: "user@example.com",
  })
  @IsOptional()
  @IsString()
  search?: string;
  
  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole) // class-validator dan IsEnum-ni import qiling
  role?: UserRole;

  get skip(): number {
    return ((this.page ?? 1) - 1) * (this.limit ?? 20);
  }
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function paginate<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
