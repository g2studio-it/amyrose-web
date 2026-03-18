import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import * as Joi from 'joi';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    // ── Config (global, validated with Joi) ───────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
      validationSchema: Joi.object({
        PORT: Joi.number().default(3001),
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        API_PREFIX: Joi.string().default('api/v1'),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(5432),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().allow('').default(''),
        DB_NAME: Joi.string().required(),
        JWT_SECRET: Joi.string().min(32).required(),
        JWT_EXPIRATION: Joi.string().default('15m'),
        JWT_REFRESH_SECRET: Joi.string().min(32).required(),
        JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
        ALLOWED_ORIGINS: Joi.string().default('http://localhost:3000'),
        THROTTLE_TTL: Joi.number().default(60),
        THROTTLE_LIMIT: Joi.number().default(100),
      }),
      validationOptions: { abortEarly: false },
    }),

    // ── Database ───────────────────────────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (cs: ConfigService) => ({
        type: 'postgres',
        host: cs.get<string>('database.host'),
        port: cs.get<number>('database.port'),
        username: cs.get<string>('database.username'),
        password: cs.get<string>('database.password'),
        database: cs.get<string>('database.name'),
        autoLoadEntities: true,
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        // synchronize only in development — use migrations in production
        synchronize: cs.get<string>('app.nodeEnv') === 'development',
        logging: cs.get<string>('app.nodeEnv') === 'development',
      }),
      inject: [ConfigService],
    }),

    // ── Rate limiting ──────────────────────────────────────────────────────────
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (cs: ConfigService) => [
        {
          ttl: cs.get<number>('app.throttleTtl', 60) * 1000,
          limit: cs.get<number>('app.throttleLimit', 100),
        },
      ],
      inject: [ConfigService],
    }),

    // ── Feature modules ────────────────────────────────────────────────────────
    AuthModule,
    UsersModule,
    CatalogModule,
    CartModule,
    OrdersModule,
  ],
  providers: [
    // JWT guard applied globally; use @Public() to opt out
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Throttler guard applied globally
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
