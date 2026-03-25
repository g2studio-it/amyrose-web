/**
 * Seed script — creates test users, categories and products.
 * Run from the backend/ directory:
 *   npm run seed
 */

import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../modules/users/entities/user.entity';
import { Category } from '../modules/catalog/entities/category.entity';
import { Product } from '../modules/catalog/entities/product.entity';
import { ProductVariant } from '../modules/catalog/entities/product-variant.entity';
import { ProductImage } from '../modules/catalog/entities/product-image.entity';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env['DB_HOST'] ?? 'localhost',
  port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
  username: process.env['DB_USERNAME'] ?? 'postgres',
  password: process.env['DB_PASSWORD'] ?? '',
  database: process.env['DB_NAME'] ?? 'amyrose_db',
  entities: [User, Category, Product, ProductVariant, ProductImage],
  synchronize: false,
});

// ── Users ─────────────────────────────────────────────────────────────────────

const USERS = [
  { email: 'admin@amyrose.com', name: 'Admin Amy Rose', password: 'admin123', role: UserRole.ADMIN },
  { email: 'customer@test.com', name: 'Cliente Test',   password: 'customer123', role: UserRole.CUSTOMER },
];

// ── Catalog data ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: 'Tortas',    slug: 'tortas',    description: 'Tortas artesanales para toda ocasión' },
  { name: 'Cupcakes',  slug: 'cupcakes',  description: 'Cupcakes individuales con decorado único' },
  { name: 'Postres',   slug: 'postres',   description: 'Postres fríos y calientes de autor' },
];

// Images from Unsplash (stable photo IDs, no API key needed)
const PRODUCTS = [
  // ── Tortas ──────────────────────────────────────────────────────────────────
  {
    category: 'tortas',
    name: 'Torta de Chocolate',
    slug: 'torta-de-chocolate',
    description: 'Húmeda torta de chocolate con ganache y decorado de cacao. Perfecta para cumpleaños.',
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80',
    variants: [
      { name: 'Pequeña (6 porciones)',  price: 8500,  stock: 8 },
      { name: 'Mediana (12 porciones)', price: 14000, stock: 6 },
      { name: 'Grande (20 porciones)',  price: 22000, stock: 4 },
    ],
  },
  {
    category: 'tortas',
    name: 'Torta Red Velvet',
    slug: 'torta-red-velvet',
    description: 'Clásica red velvet con frosting de queso crema y cobertura de terciopelo rojo.',
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=600&q=80',
    variants: [
      { name: 'Pequeña (6 porciones)',  price: 9500,  stock: 6 },
      { name: 'Mediana (12 porciones)', price: 16000, stock: 5 },
      { name: 'Grande (20 porciones)',  price: 25000, stock: 3 },
    ],
  },
  {
    category: 'tortas',
    name: 'Torta de Vainilla y Frutos Rojos',
    slug: 'torta-vainilla-frutos-rojos',
    description: 'Esponjosa torta de vainilla con crema chantillí y berries frescos de temporada.',
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&q=80',
    variants: [
      { name: 'Pequeña (6 porciones)',  price: 9000,  stock: 7 },
      { name: 'Mediana (12 porciones)', price: 15500, stock: 5 },
    ],
  },
  {
    category: 'tortas',
    name: 'Torta de Limón y Merengue',
    slug: 'torta-limon-merengue',
    description: 'Refrescante combinación de bizcochuelo de limón, lemon curd y merengue italiano tostado.',
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=600&q=80',
    variants: [
      { name: 'Pequeña (6 porciones)',  price: 8000,  stock: 6 },
      { name: 'Mediana (12 porciones)', price: 13500, stock: 4 },
      { name: 'Grande (20 porciones)',  price: 21000, stock: 2 },
    ],
  },
  // ── Cupcakes ─────────────────────────────────────────────────────────────────
  {
    category: 'cupcakes',
    name: 'Cupcakes de Chocolate',
    slug: 'cupcakes-chocolate',
    description: 'Suaves cupcakes de chocolate con frosting de buttercream de chocolate belga.',
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=600&q=80',
    variants: [
      { name: 'Caja x6',  price: 4200, stock: 15 },
      { name: 'Caja x12', price: 7800, stock: 10 },
    ],
  },
  {
    category: 'cupcakes',
    name: 'Cupcakes de Vainilla',
    slug: 'cupcakes-vainilla',
    description: 'Esponjosos cupcakes de vainilla con frosting de crema y chispas de colores.',
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1551404973-761c83cd8339?w=600&q=80',
    variants: [
      { name: 'Caja x6',  price: 3800, stock: 20 },
      { name: 'Caja x12', price: 7000, stock: 12 },
    ],
  },
  {
    category: 'cupcakes',
    name: 'Cupcakes Red Velvet',
    slug: 'cupcakes-red-velvet',
    description: 'Miniatura del clásico red velvet con frosting de queso crema y decorado en rojo.',
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1568051243858-533a607809a5?w=600&q=80',
    variants: [
      { name: 'Caja x6',  price: 4500, stock: 12 },
      { name: 'Caja x12', price: 8400, stock: 8 },
    ],
  },
  // ── Postres ──────────────────────────────────────────────────────────────────
  {
    category: 'postres',
    name: 'Cheesecake de Frutos Rojos',
    slug: 'cheesecake-frutos-rojos',
    description: 'Cremoso cheesecake horneado con base de galleta y coulis de berries naturales.',
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&q=80',
    variants: [
      { name: 'Porción individual', price: 2800, stock: 20 },
      { name: 'Torta entera (8 porciones)', price: 18500, stock: 5 },
    ],
  },
  {
    category: 'postres',
    name: 'Tiramisú Artesanal',
    slug: 'tiramisu-artesanal',
    description: 'Auténtico tiramisú con mascarpone, café espresso y cacao amargo importado.',
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80',
    variants: [
      { name: 'Porción individual', price: 3200, stock: 15 },
      { name: 'Bandeja x6 porciones', price: 17000, stock: 6 },
    ],
  },
  {
    category: 'postres',
    name: 'Brownie con Helado',
    slug: 'brownie-con-helado',
    description: 'Brownie de chocolate oscuro tibio acompañado de helado de vainilla artesanal.',
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=600&q=80',
    variants: [
      { name: 'Porción individual', price: 2500, stock: 25 },
      { name: 'Bandeja x4 porciones', price: 9000, stock: 8 },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

async function seedUsers(ds: DataSource) {
  const repo = ds.getRepository(User);
  console.log('\n── Usuarios ─────────────────────────────────────');
  for (const data of USERS) {
    const existing = await repo.findOne({ where: { email: data.email } });
    if (existing) { console.log(`  ⚠  ${data.email} ya existe — se omite`); continue; }
    const hashed = await bcrypt.hash(data.password, 12);
    await repo.save(repo.create({ ...data, password: hashed, isActive: true }));
    console.log(`  ✓  [${data.role}] ${data.email} / ${data.password}`);
  }
}

async function seedCatalog(ds: DataSource) {
  const catRepo     = ds.getRepository(Category);
  const prodRepo    = ds.getRepository(Product);
  const variantRepo = ds.getRepository(ProductVariant);
  const imageRepo   = ds.getRepository(ProductImage);

  console.log('\n── Categorías ───────────────────────────────────');
  const categoryMap: Record<string, Category> = {};
  for (const data of CATEGORIES) {
    let cat = await catRepo.findOne({ where: { slug: data.slug } });
    if (cat) {
      console.log(`  ⚠  Categoría "${data.name}" ya existe — se omite`);
    } else {
      cat = await catRepo.save(catRepo.create({ ...data, isActive: true }));
      console.log(`  ✓  Categoría "${data.name}"`);
    }
    categoryMap[data.slug] = cat;
  }

  console.log('\n── Productos ────────────────────────────────────');
  for (const [i, data] of PRODUCTS.entries()) {
    const existing = await prodRepo.findOne({ where: { slug: data.slug } });
    if (existing) { console.log(`  ⚠  "${data.name}" ya existe — se omite`); continue; }

    const category = categoryMap[data.category];
    const product = await prodRepo.save(prodRepo.create({
      name: data.name,
      slug: data.slug,
      description: data.description,
      isFeatured: data.isFeatured,
      isActive: true,
      sortOrder: i,
      categoryId: category.id,
    }));

    // variants
    for (const [j, v] of data.variants.entries()) {
      await variantRepo.save(variantRepo.create({
        productId: product.id,
        name: v.name,
        price: v.price,
        stock: v.stock,
        isActive: true,
        sortOrder: j,
      }));
    }

    // primary image
    await imageRepo.save(imageRepo.create({
      productId: product.id,
      url: data.image,
      altText: data.name,
      isPrimary: true,
      sortOrder: 0,
    }));

    console.log(`  ✓  "${data.name}" (${data.variants.length} variantes)`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function seed() {
  await dataSource.initialize();
  await seedUsers(dataSource);
  await seedCatalog(dataSource);
  await dataSource.destroy();
  console.log('\n✅  Seed completado.\n');
}

seed().catch((err) => {
  console.error('Error en seed:', err);
  process.exit(1);
});
