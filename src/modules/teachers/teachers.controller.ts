import {
  Controller,
  Get,
  Post,
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
  ApiParam,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { TeachersService } from './teachers.service';
// import { CreateTeacherDto, UpdateTeacherDto, FilterTeacherDto } from './teacher.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { FilterTeacherDto } from './dto/filter-teacher.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@ApiTags('Teachers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get()
  @ApiOperation({ summary: 'O\'qituvchilar ro\'yxati (filterlash bilan)' })
  @ApiOkResponse({ description: 'Sahifalangan o\'qituvchilar' })
  findAll(@Query() filter: FilterTeacherDto) {
    return this.teachersService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({
    summary:
      'O\'qituvchi to\'liq ma\'lumotlari (guruhlar, maosh tarixi, statistika)',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'O\'qituvchi + bog\'liq ma\'lumotlar' })
  @ApiNotFoundResponse({ description: 'Topilmadi' })
  findOne(@Param('id') id: string) {
    return this.teachersService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Yangi o\'qituvchi profili yaratish (mavjud user bilan bog\'laydi)',
  })
  @ApiCreatedResponse({ description: 'Yaratilgan o\'qituvchi profili' })
  @ApiForbiddenResponse({ description: 'Faqat admin' })
  create(@Body() dto: CreateTeacherDto) {
    return this.teachersService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'O\'qituvchi ma\'lumotlarini yangilash' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Yangilangan profil' })
  @ApiNotFoundResponse({ description: 'Topilmadi' })
  update(@Param('id') id: string, @Body() dto: UpdateTeacherDto) {
    return this.teachersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'O\'qituvchini o\'chirish (faol guruhlar bo\'lmasligi kerak)',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'O\'chirildi' })
  @ApiNotFoundResponse({ description: 'Topilmadi' })
  remove(@Param('id') id: string) {
    return this.teachersService.softDelete(id);
  }
}
