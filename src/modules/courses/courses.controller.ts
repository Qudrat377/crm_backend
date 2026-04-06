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
  ApiQuery,
  ApiParam,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto } from './course.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'Barcha kurslar ro\'yxati' })
  @ApiQuery({
    name: 'branchId',
    required: false,
    description: 'Filial UUID (faqat shu filialdagi kurslar)',
  })
  @ApiOkResponse({ description: 'Kurslar ro\'yxati' })
  findAll(@Query('branchId') branchId?: string) {
    return this.coursesService.findAll(branchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Kurs ma\'lumotlari' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Kurs obyekti' })
  @ApiNotFoundResponse({ description: 'Topilmadi' })
  findOne(@Param('id') id: string) {
    return this.coursesService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Yangi kurs yaratish' })
  @ApiCreatedResponse({ description: 'Yaratilgan kurs' })
  @ApiForbiddenResponse({ description: 'Ruxsat yo\'q' })
  create(@Body() dto: CreateCourseDto) {
    return this.coursesService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Kursni yangilash' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Yangilangan kurs' })
  @ApiNotFoundResponse({ description: 'Topilmadi' })
  update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Kursni o\'chirish' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'O\'chirildi' })
  @ApiNotFoundResponse({ description: 'Topilmadi' })
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }
}
