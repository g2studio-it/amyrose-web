# Amy Rose Bakery

Application FullStack Web — Amy Rose Bakery Ecommerce

## Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM v7
- **UI**: Tailwind CSS v4 + shadcn/ui
- **Auth**: NextAuth.js v5 (Auth.js)
- **Payments**: MercadoPago
- **i18n**: next-intl (Español + English)
- **State**: Zustand
- **Validation**: Zod + react-hook-form

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Configure your `.env` file with your credentials.

4. Generate Prisma client:
   ```bash
   npm run db:generate
   ```

5. Run migrations:
   ```bash
   npm run db:migrate
   ```

6. Seed the database:
   ```bash
   npm run db:seed
   ```
   This creates an admin user (`admin@amyrose.com` / `admin123`) and sample categories/products.

7. Start the dev server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/es` by default.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed initial data |
| `npm run db:studio` | Open Prisma Studio |

## Project Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── (shop)/       # Public storefront
│   │   ├── (auth)/       # Login & Register
│   │   └── (admin)/      # Admin panel (ADMIN role required)
│   └── api/              # API routes
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Header, Footer
│   ├── shop/             # Storefront components
│   └── admin/            # Admin components
├── lib/                  # prisma, mercadopago, utils
├── store/                # Zustand cart store
├── schemas/              # Zod schemas
└── i18n/                 # next-intl config
```

## Roles

- **ADMIN** — Full access: manage products, categories, orders, stock
- **CUSTOMER** — Browse catalog, purchase, view order history
