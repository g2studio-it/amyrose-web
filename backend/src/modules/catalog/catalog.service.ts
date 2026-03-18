import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFiltersDto } from './dto/product-filters.dto';
import { PaginatedResult } from '../users/dto/pagination-query.dto';

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
  ) {}

  // ── Categories ───────────────────────────────────────────────────────────────

  /**
   * Create a new category with a unique slug.
   */
  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    this.logger.log(`Creating category: ${dto.slug}`);
    const existing = await this.categoryRepo.findOne({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('Ya existe una categoría con ese slug');
    return this.categoryRepo.save(this.categoryRepo.create(dto));
  }

  /**
   * Return all active categories ordered by sortOrder.
   */
  async findAllCategories(): Promise<Category[]> {
    return this.categoryRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Find a category by slug including its products.
   */
  async findCategoryBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { slug, isActive: true },
      relations: ['products'],
    });
    if (!category) throw new NotFoundException(`Categoría '${slug}' no encontrada`);
    return category;
  }

  // ── Products ─────────────────────────────────────────────────────────────────

  /**
   * Create a product with its initial variants.
   */
  async createProduct(dto: CreateProductDto): Promise<Product> {
    this.logger.log(`Creating product: ${dto.slug}`);

    const [existing, category] = await Promise.all([
      this.productRepo.findOne({ where: { slug: dto.slug } }),
      this.categoryRepo.findOne({ where: { id: dto.categoryId } }),
    ]);

    if (existing) throw new ConflictException('Ya existe un producto con ese slug');
    if (!category) throw new NotFoundException('Categoría no encontrada');

    const { variants, ...productData } = dto;
    const product = await this.productRepo.save(this.productRepo.create(productData));

    if (variants?.length) {
      const entities = variants.map((v, i) =>
        this.variantRepo.create({ ...v, productId: product.id, sortOrder: i }),
      );
      await this.variantRepo.save(entities);
    }

    return this.findProductById(product.id);
  }

  /**
   * Paginated product listing with optional filters.
   */
  async findProducts(filters: ProductFiltersDto): Promise<PaginatedResult<Product>> {
    const { page = 1, limit = 10, search, categoryId, categorySlug, featured } = filters;

    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.variants', 'variants')
      .where('product.isActive = true');

    if (categoryId) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId });
    }
    if (categorySlug) {
      qb.andWhere('category.slug = :categorySlug', { categorySlug });
    }
    if (featured !== undefined) {
      qb.andWhere('product.isFeatured = :featured', { featured });
    }
    if (search) {
      qb.andWhere(
        '(LOWER(product.name) LIKE :q OR LOWER(product.description) LIKE :q)',
        { q: `%${search.toLowerCase()}%` },
      );
    }

    qb.orderBy('product.sortOrder', 'ASC').addOrderBy('product.createdAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  /**
   * Find a single product by slug (public-facing).
   */
  async findProductBySlug(slug: string): Promise<Product> {
    const product = await this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.variants', 'variants')
      .where('product.slug = :slug', { slug })
      .andWhere('product.isActive = true')
      .getOne();

    if (!product) throw new NotFoundException(`Producto '${slug}' no encontrado`);
    return product;
  }

  /**
   * Find a product by UUID — used internally and by admin endpoints.
   */
  async findProductById(id: string): Promise<Product> {
    const product = await this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.variants', 'variants')
      .where('product.id = :id', { id })
      .getOne();

    if (!product) throw new NotFoundException(`Producto '${id}' no encontrado`);
    return product;
  }

  /**
   * Update product fields (variants update handled separately if needed).
   */
  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    await this.findProductById(id);
    const { variants: _, ...productData } = dto;
    await this.productRepo.update(id, productData);
    return this.findProductById(id);
  }

  /**
   * Soft-disable a product (sets isActive = false).
   */
  async deleteProduct(id: string): Promise<void> {
    await this.findProductById(id);
    await this.productRepo.update(id, { isActive: false });
  }
}
