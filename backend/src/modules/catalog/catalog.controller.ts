import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFiltersDto } from './dto/product-filters.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  // ── Categories (public reads / admin writes) ──────────────────────────────

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Listar categorías activas' })
  findAllCategories() {
    return this.catalogService.findAllCategories();
  }

  @Public()
  @Get('categories/:slug')
  @ApiParam({ name: 'slug', example: 'tortas' })
  @ApiOperation({ summary: 'Obtener categoría por slug' })
  findCategoryBySlug(@Param('slug') slug: string) {
    return this.catalogService.findCategoryBySlug(slug);
  }

  @Post('categories')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear categoría — solo ADMIN' })
  @ApiResponse({ status: 201, description: 'Categoría creada' })
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.catalogService.createCategory(dto);
  }

  // ── Products (public reads / admin writes) ────────────────────────────────

  @Public()
  @Get('products')
  @ApiOperation({ summary: 'Listar productos con filtros y paginación' })
  findProducts(@Query() filters: ProductFiltersDto) {
    return this.catalogService.findProducts(filters);
  }

  @Public()
  @Get('products/:slug')
  @ApiParam({ name: 'slug', example: 'torta-de-chocolate' })
  @ApiOperation({ summary: 'Obtener producto por slug' })
  findProductBySlug(@Param('slug') slug: string) {
    return this.catalogService.findProductBySlug(slug);
  }

  @Post('products')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear producto — solo ADMIN' })
  createProduct(@Body() dto: CreateProductDto) {
    return this.catalogService.createProduct(dto);
  }

  @Patch('products/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'UUID del producto' })
  @ApiOperation({ summary: 'Actualizar producto — solo ADMIN' })
  updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.catalogService.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', description: 'UUID del producto' })
  @ApiOperation({ summary: 'Desactivar producto — solo ADMIN' })
  deleteProduct(@Param('id') id: string) {
    return this.catalogService.deleteProduct(id);
  }
}
