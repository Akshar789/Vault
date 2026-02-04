import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseService } from './database/database.service';
import { RedisService } from './redis/redis.service';
import { HealthController } from './health/health.controller';
import { AuthModule } from './auth/auth.module';
import { VaultModule } from './vault/vault.module';
import { join } from 'path';

/**
 * Main Application Module
 * 
 * ARCHITECTURE:
 * - Stateless design for horizontal scaling
 * - Database connection pooling
 * - Redis for rate limiting and caching
 * - Environment-based configuration
 */
@Module({
  imports: [
    // Configuration - load from project root
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(process.cwd(), '.env.local'),
        join(process.cwd(), '.env'),
      ],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
        limit: parseInt(process.env.RATE_LIMIT_MAX || '100'),
      },
    ]),

    // Feature modules
    AuthModule,
    VaultModule,
  ],
  controllers: [HealthController],
  providers: [DatabaseService, RedisService],
})
export class AppModule {}
