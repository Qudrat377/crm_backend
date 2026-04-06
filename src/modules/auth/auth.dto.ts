import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../common/enums';

export class RegisterDto {
  @ApiProperty({ example: 'admin@crm.uz', description: 'Tizimga kirish emaili' })
  @IsEmail({}, { message: 'Email noto\'g\'ri formatda' })
  email: string;

  @ApiProperty({
    example: 'StrongPass123!',
    minLength: 8,
    description: 'Kamida 8 belgi',
  })
  @IsString()
  @MinLength(8, { message: 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak' })
  password: string;

  @ApiPropertyOptional({
    enum: UserRole,
    default: UserRole.TEACHER,
    description: 'Yangi akkaunt roli (default: teacher)',
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Noto\'g\'ri rol' })
  role?: UserRole;
}

export class LoginDto {
  @ApiProperty({ example: 'admin@crm.uz', description: 'Ro\'yxatdan o\'tgan email' })
  @IsEmail({}, { message: 'Email noto\'g\'ri formatda' })
  email: string;

  @ApiProperty({ example: 'StrongPass123!', description: 'Parol' })
  @IsString()
  @IsNotEmpty({ message: 'Parol bo\'sh bo\'lmasligi kerak' })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Login yoki refresh javobidan olingan refresh token',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
