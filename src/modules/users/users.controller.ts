import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
// import { UpdateUserDto } from './user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UserRole } from '../../common/enums';
import { UpdateUserDto } from './dto/user-update.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Barcha foydalanuvchilar ro\'yxati' })
  @ApiQuery({ name: 'role', enum: UserRole, required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'Sahifalangan foydalanuvchilar ro\'yxati' })
  @ApiUnauthorizedResponse({ description: 'JWT kerak' })
  @ApiForbiddenResponse({ description: 'Faqat admin' })
  findAll(@Query() pagination: PaginationDto, @Query('role') role?: UserRole) {
    return this.usersService.findAll(pagination, role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Foydalanuvchi ma\'lumotlari' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Foydalanuvchi UUID' })
  @ApiOkResponse({ description: 'Bitta foydalanuvchi' })
  @ApiNotFoundResponse({ description: 'Topilmadi' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Foydalanuvchi rolini o\'zgartirish' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Yangilangan foydalanuvchi' })
  @ApiNotFoundResponse({ description: 'Topilmadi' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Foydalanuvchini deaktivlashtirish' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Deaktivlashtirildi' })
  @ApiNotFoundResponse({ description: 'Topilmadi' })
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }
}
