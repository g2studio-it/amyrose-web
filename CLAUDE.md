# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Amy Rose Bakery** — a full-stack e-commerce application. The repo is a monorepo with a Next.js 16 frontend at the root and a NestJS backend under `backend/`.

## Commands

### Frontend (run from `frontend/`)

```bash
npm run dev          # Start Next.js dev server (app runs at localhost:3000, redirects to /es)
npm run build        # Production build
npm run lint         # ESLint (flat config, v9)
```

### Database (Prisma — run from `frontend/`)

```bash
npm run db:generate  # Generate Prisma client after schema changes
npm run db:migrate   # Run pending migrations (dev)
npm run db:seed      # Seed DB (creates admin@amyrose.com / admin123)
npm run db:studio    # Open Prisma Studio GUI
```

### Backend (run from `backend/`)

```bash
npm run start:dev    # NestJS dev server with watch mode (port 3001)
npm run build        # Compile TypeScript
npm run test         # Jest unit tests
npm run test:watch   # Jest in watch mode
npm run test:cov     # Coverage report
npm run test:e2e     # End-to-end tests

# TypeORM migrations (requires build first)
npm run migration:generate
npm run migration:run
npm run migration:revert
```

## Architecture

### Frontend (`frontend/src/`)

- **App Router** with dynamic `[locale]` segment — all pages live under `frontend/src/app/[locale]/`
- Route groups:
  - `(shop)/` — public storefront
  - `(auth)/` — login / register
  - `(admin)/` — admin panel, gated to ADMIN role via `frontend/middleware.ts`
- **`frontend/src/actions/`** — Next.js server actions (DB mutations called from client)
- **`frontend/src/store/`** — Zustand stores (cart state)
- **`frontend/src/schemas/`** — Zod schemas shared between forms and server actions
- **`frontend/src/lib/`** — Prisma singleton client, MercadoPago client, utility functions
- **`frontend/src/i18n/`** + **`frontend/messages/`** — next-intl config; locale files in `messages/es.json` / `messages/en.json`
- **`frontend/src/auth.ts`** / **`frontend/src/auth.config.ts`** — NextAuth v5 (Auth.js) configuration with Prisma adapter

### Backend (`backend/src/`)

NestJS feature-module structure:
- `modules/auth/` — JWT + Passport (local & JWT strategies), access/refresh tokens
- `modules/users/` — user management
- `modules/catalog/` — products & categories
- `modules/cart/` — shopping cart
- `modules/orders/` — order management
- `common/` — shared guards, decorators, interceptors
- `config/` — database config, environment validation

TypeORM is used for the backend ORM (separate from Prisma used by the frontend).

### Database

- **PostgreSQL** shared by both apps
- **Prisma** (frontend) manages schema (`frontend/prisma/schema.prisma`) and migrations
- **TypeORM** (backend) has its own migrations in `backend/src/database/`
- Key entities: User (ADMIN/CUSTOMER roles), Product, ProductVariant, ProductImage, Category, Cart, CartItem, Order, OrderItem, Address

### Auth

- Frontend uses **NextAuth v5** with Prisma adapter; sessions stored in DB
- Middleware (`middleware.ts`) enforces locale routing and protects `/admin` (ADMIN only) and `/orders` (authenticated only)
- Backend uses **JWT** (access token 15m, refresh token 7d) via Passport strategies

### Payments

- **MercadoPago** integration — server-side via `MERCADOPAGO_ACCESS_TOKEN`, webhook at `src/app/api/payments/`
- Public key exposed as `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`

### Internationalization

- Supported locales: `es` (default), `en`
- All UI strings go through `next-intl`; message files in `messages/`

## Environment Setup

Copy `frontend/.env.example` → `frontend/.env`, and `backend/.env.example` → `backend/.env`. Key variables:

- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — generate with `openssl rand -base64 32`
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — generate with `openssl rand -hex 32`

## UI Components

Uses **shadcn/ui** (style: `new-york`) with Tailwind CSS v4. Add new components via the shadcn CLI (run from `frontend/`). Components are generated into `frontend/src/components/ui/`. Path alias `@/` maps to `frontend/src/`.
