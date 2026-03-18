import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@amyrose.com' },
    update: {},
    create: {
      email: 'admin@amyrose.com',
      name: 'Amy Rose',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'tortas' },
      update: {},
      create: {
        name: 'Tortas',
        slug: 'tortas',
        description: 'Tortas artesanales para toda ocasión',
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'facturas' },
      update: {},
      create: {
        name: 'Facturas',
        slug: 'facturas',
        description: 'Medialunas, vigilantes y más',
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'cupcakes' },
      update: {},
      create: {
        name: 'Cupcakes',
        slug: 'cupcakes',
        description: 'Cupcakes decorados a mano',
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'cookies' },
      update: {},
      create: {
        name: 'Cookies',
        slug: 'cookies',
        description: 'Galletitas artesanales',
        sortOrder: 4,
      },
    }),
  ]);
  console.log(`✅ ${categories.length} categories created`);

  // Create sample product
  const tortaChocolate = await prisma.product.upsert({
    where: { slug: 'torta-de-chocolate' },
    update: {},
    create: {
      categoryId: categories[0].id,
      name: 'Torta de Chocolate',
      slug: 'torta-de-chocolate',
      description: 'Torta de chocolate artesanal con ganache de cacao fino y relleno de dulce de leche.',
      isActive: true,
      isFeatured: true,
      variants: {
        create: [
          { name: 'Pequeña (6 porciones)', price: 3500, stock: 10, sortOrder: 0 },
          { name: 'Mediana (12 porciones)', price: 6500, stock: 8, sortOrder: 1 },
          { name: 'Grande (20 porciones)', price: 10000, stock: 5, sortOrder: 2 },
        ],
      },
    },
  });
  console.log('✅ Sample product created:', tortaChocolate.name);

  console.log('🌱 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
