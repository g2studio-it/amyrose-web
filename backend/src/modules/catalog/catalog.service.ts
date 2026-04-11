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
import { ProductImage } from './entities/product-image.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateProductDto, CreateProductVariantDto } from './dto/create-product.dto';
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
    @InjectRepository(ProductImage)
    private readonly imageRepo: Repository<ProductImage>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
  ) {}

  // ── Categories ───────────────────────────────────────────────────────────────

  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    this.logger.log(`Creating category: ${dto.slug}`);
    const existing = await this.categoryRepo.findOne({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('Ya existe una categoría con ese slug');
    return this.categoryRepo.save(this.categoryRepo.create(dto));
  }

  async findAllCategories(): Promise<Category[]> {
    return this.categoryRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findCategoryBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { slug, isActive: true },
      relations: ['products'],
    });
    if (!category) throw new NotFoundException(`Categoría '${slug}' no encontrada`);
    return category;
  }

  // ── Products ─────────────────────────────────────────────────────────────────

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

  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    await this.findProductById(id);
    const { variants: _, ...productData } = dto;
    await this.productRepo.update(id, productData);
    return this.findProductById(id);
  }

  async deleteProduct(id: string): Promise<void> {
    await this.findProductById(id);
    await this.productRepo.update(id, { isActive: false });
  }

  // ── Product Images ────────────────────────────────────────────────────────────

  async addProductImage(
    productId: string,
    data: { url: string; altText?: string; isPrimary?: boolean },
  ): Promise<ProductImage> {
    await this.findProductById(productId);

    if (data.isPrimary) {
      await this.imageRepo.update({ productId }, { isPrimary: false });
    }

    const count = await this.imageRepo.count({ where: { productId } });
    const image = this.imageRepo.create({
      productId,
      url: data.url,
      altText: data.altText,
      isPrimary: data.isPrimary ?? count === 0,
      sortOrder: count,
    });

    return this.imageRepo.save(image);
  }

  async updateProductImage(
    productId: string,
    imageId: string,
    data: { altText?: string; isPrimary?: boolean },
  ): Promise<ProductImage> {
    const image = await this.imageRepo.findOne({ where: { id: imageId, productId } });
    if (!image) throw new NotFoundException('Imagen no encontrada');

    if (data.isPrimary) {
      await this.imageRepo.update({ productId }, { isPrimary: false });
    }

    Object.assign(image, data);
    return this.imageRepo.save(image);
  }

  async deleteProductImage(productId: string, imageId: string): Promise<void> {
    const image = await this.imageRepo.findOne({ where: { id: imageId, productId } });
    if (!image) throw new NotFoundException('Imagen no encontrada');
    await this.imageRepo.remove(image);

    // If deleted image was primary, assign primary to next available
    if (image.isPrimary) {
      const next = await this.imageRepo.findOne({
        where: { productId },
        order: { sortOrder: 'ASC' },
      });
      if (next) await this.imageRepo.update(next.id, { isPrimary: true });
    }
  }

  // ── Product Variants ──────────────────────────────────────────────────────────

  async addProductVariant(
    productId: string,
    dto: CreateProductVariantDto,
  ): Promise<ProductVariant> {
    await this.findProductById(productId);
    const count = await this.variantRepo.count({ where: { productId } });
    const variant = this.variantRepo.create({ ...dto, productId, sortOrder: count });
    return this.variantRepo.save(variant);
  }

  async updateProductVariant(
    productId: string,
    variantId: string,
    data: Partial<{ name: string; price: number; stock: number; sku: string; isActive: boolean }>,
  ): Promise<ProductVariant> {
    const variant = await this.variantRepo.findOne({ where: { id: variantId, productId } });
    if (!variant) throw new NotFoundException('Variante no encontrada');
    Object.assign(variant, data);
    return this.variantRepo.save(variant);
  }

  async deleteProductVariant(productId: string, variantId: string): Promise<void> {
    const variant = await this.variantRepo.findOne({ where: { id: variantId, productId } });
    if (!variant) throw new NotFoundException('Variante no encontrada');
    await this.variantRepo.remove(variant);
  }
}
