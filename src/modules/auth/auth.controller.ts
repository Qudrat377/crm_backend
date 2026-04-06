import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Yangi foydalanuvchi ro\'yxatdan o\'tkazish' })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({ description: 'Foydalanuvchi yaratildi, tokenlar qaytariladi' })
  @ApiBadRequestResponse({ description: 'Validatsiya yoki email band' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tizimga kirish' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'accessToken, refreshToken va foydalanuvchi' })
  @ApiBadRequestResponse({ description: 'Noto\'g\'ri email yoki parol' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Access tokenni yangilash' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({ description: 'Yangi access/refresh tokenlar' })
  @ApiUnauthorizedResponse({ description: 'Refresh token yaroqsiz' })
  refresh(@Body() dto: RefreshTokenDto, @CurrentUser('sub') userId: string) {
    return this.authService.refreshTokens(userId, dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tizimdan chiqish' })
  @ApiOkResponse({ description: 'Refresh token bekor qilindi' })
  @ApiUnauthorizedResponse({ description: 'JWT yo\'q yoki yaroqsiz' })
  logout(@CurrentUser() user: JwtPayload) {
    return this.authService.logout(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Joriy foydalanuvchi ma\'lumotlari' })
  @ApiOkResponse({ description: 'JWT payload (sub, email, role, ...)' })
  @ApiUnauthorizedResponse({ description: 'JWT yo\'q yoki yaroqsiz' })
  me(@CurrentUser() user: JwtPayload) {
    return user;
  }
}
