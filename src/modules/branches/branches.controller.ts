import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { BranchesService } from './branches.service';
import { CreateBranchDto, UpdateBranchDto } from './branch.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Branches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  @ApiOperation({ summary: 'Barcha filiallar ro\'yxati' })
  @ApiOkResponse({ description: 'Filiallar massivi' })
  @ApiUnauthorizedResponse({ description: 'JWT kerak' })
  findAll() {
    return this.branchesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Filial ma\'lumotlari' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Filial obyekti' })
  @ApiNotFoundResponse({ description: 'Topilmadi' })
  findOne(@Param('id') id: string) {
    return this.branchesService.findById(id);
  }

  @Get(':id/stats')
  @ApiOperation({
    summary:
      'Filial statistikasi (o\'qituvchilar, o\'quvchilar, guruhlar soni)',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Hisoblangan statistikalar' })
  @ApiNotFoundResponse({ description: 'Filial topilmadi' })
  stats(@Param('id') id: string) {
    return this.branchesService.getStats(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Yangi filial yaratish' })
  @ApiCreatedResponse({ description: 'Yaratilgan filial' })
  @ApiForbiddenResponse({ description: 'Faqat admin' })
  create(@Body() dto: CreateBranchDto) {
    return this.branchesService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Filial ma\'lumotlarini yangilash' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Yangilangan filial' })
  @ApiNotFoundResponse({ description: 'Topilmadi' })
  update(@Param('id') id: string, @Body() dto: UpdateBranchDto) {
    return this.branchesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Filialni o\'chirish' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'O\'chirildi' })
  @ApiNotFoundResponse({ description: 'Topilmadi' })
  remove(@Param('id') id: string) {
    return this.branchesService.remove(id);
  }
}
