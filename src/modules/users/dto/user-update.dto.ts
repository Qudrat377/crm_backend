// import { UserRole } from '@/common/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from 'src/common/enums';

export class UpdateUserDto {
  @ApiPropertyOptional({
    enum: UserRole,
    description: 'Foydalanuvchi roli (admin, manager, teacher)',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Akkount faolligi (false bo\'lsa tizimga kira olmaydi)',
    example: true,
  })
  @IsOptional()
  isActive?: boolean;
}
