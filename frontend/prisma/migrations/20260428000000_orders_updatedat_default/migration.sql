-- Add database-level default to updatedAt so TypeORM's @UpdateDateColumn can rely on it during INSERT
ALTER TABLE "orders" ALTER COLUMN "updatedAt" SET DEFAULT now();
