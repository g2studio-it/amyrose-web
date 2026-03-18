import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

// Load .env for TypeORM CLI usage (outside NestJS bootstrap)
dotenv.config();

const options: DataSourceOptions = {
  type: 'postgres',
  host: process.env['DB_HOST'] ?? 'localhost',
  port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
  username: process.env['DB_USERNAME'] ?? 'postgres',
  password: process.env['DB_PASSWORD'] ?? '',
  database: process.env['DB_NAME'] ?? 'amyrose_db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: false,
};

/** Used by the TypeORM CLI (migration:generate / migration:run) */
export const AppDataSource = new DataSource(options);

export default registerAs('database', () => ({
  host: process.env['DB_HOST'],
  port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
  username: process.env['DB_USERNAME'],
  password: process.env['DB_PASSWORD'],
  name: process.env['DB_NAME'],
}));
