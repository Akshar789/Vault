import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RedisService } from '../redis/redis.service';

/**
 * Health Check Controller
 * 
 * Used by:
 * - Fly.io health checks
 * - Monitoring systems
 * - Load balancers
 */
@Controller('health')
export class HealthController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  async check() {
    const dbHealthy = await this.databaseService.healthCheck();
    const redisHealthy = await this.redisService.healthCheck();

    const status = dbHealthy && redisHealthy ? 'healthy' : 'unhealthy';

    return {
      status,
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy ? 'up' : 'down',
        redis: redisHealthy ? 'up' : 'down',
      },
    };
  }

  @Get('ready')
  async ready() {
    return {
      ready: true,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('live')
  async live() {
    return {
      alive: true,
      timestamp: new Date().toISOString(),
    };
  }
}
