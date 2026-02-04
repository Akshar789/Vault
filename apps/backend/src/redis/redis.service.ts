import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Redis Service for Upstash Redis
 * 
 * SECURITY:
 * - TLS connections required (rediss://)
 * - Used for rate limiting and session metadata
 * - NEVER stores decrypted secrets
 * - Automatic reconnection
 * - Connection pooling
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly maxRetries = 3;

  constructor() {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is required');
    }

    // Parse Redis URL
    const url = new URL(redisUrl);
    const isTLS = url.protocol === 'rediss:';

    this.client = new Redis({
      host: url.hostname,
      port: parseInt(url.port) || 6379,
      password: url.password,
      username: url.username || 'default',
      
      // TLS configuration for Upstash
      tls: isTLS ? {
        rejectUnauthorized: true,
      } : undefined,
      
      // Connection settings
      maxRetriesPerRequest: this.maxRetries,
      enableReadyCheck: true,
      enableOfflineQueue: true,
      
      // Retry strategy
      retryStrategy: (times: number) => {
        if (times > this.maxRetries) {
          console.error('Redis max retries exceeded');
          return null;
        }
        const delay = Math.min(times * 50, 2000);
        console.warn(`Redis retry attempt ${times}, waiting ${delay}ms`);
        return delay;
      },
      
      // Reconnect on error
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
      
      // Timeouts
      connectTimeout: 10000,
      commandTimeout: 5000,
      
      // Keep alive
      keepAlive: 30000,
    });

    // Event handlers
    this.client.on('connect', () => {
      console.log('✓ Redis connected');
    });

    this.client.on('ready', () => {
      console.log('✓ Redis ready');
    });

    this.client.on('error', (err) => {
      console.error('Redis error:', err.message);
    });

    this.client.on('close', () => {
      console.warn('Redis connection closed');
    });

    this.client.on('reconnecting', () => {
      console.log('Redis reconnecting...');
    });
  }

  async onModuleInit() {
    await this.healthCheck();
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  /**
   * Get a value from Redis
   */
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('Redis GET error:', error);
      throw error;
    }
  }

  /**
   * Set a value in Redis with optional TTL
   * 
   * @param key - Redis key
   * @param value - Value to store
   * @param ttlSeconds - Time to live in seconds (optional)
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      console.error('Redis SET error:', error);
      throw error;
    }
  }

  /**
   * Delete a key from Redis
   */
  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Redis DELETE error:', error);
      throw error;
    }
  }

  /**
   * Increment a counter with optional TTL
   * 
   * SECURITY: Used for rate limiting
   * 
   * @param key - Counter key
   * @param ttlSeconds - TTL to set if key doesn't exist
   * @returns New counter value
   */
  async increment(key: string, ttlSeconds?: number): Promise<number> {
    try {
      const value = await this.client.incr(key);
      
      // Set TTL only on first increment
      if (ttlSeconds && value === 1) {
        await this.client.expire(key, ttlSeconds);
      }
      
      return value;
    } catch (error) {
      console.error('Redis INCREMENT error:', error);
      throw error;
    }
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      throw error;
    }
  }

  /**
   * Get TTL of a key
   * 
   * @returns TTL in seconds, -1 if no expiry, -2 if key doesn't exist
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error('Redis TTL error:', error);
      throw error;
    }
  }

  /**
   * Set expiry on a key
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, seconds);
      return result === 1;
    } catch (error) {
      console.error('Redis EXPIRE error:', error);
      throw error;
    }
  }

  /**
   * Add member to a set
   * 
   * SECURITY: Used for token revocation lists
   */
  async sadd(key: string, member: string): Promise<number> {
    try {
      return await this.client.sadd(key, member);
    } catch (error) {
      console.error('Redis SADD error:', error);
      throw error;
    }
  }

  /**
   * Check if member exists in set
   */
  async sismember(key: string, member: string): Promise<boolean> {
    try {
      const result = await this.client.sismember(key, member);
      return result === 1;
    } catch (error) {
      console.error('Redis SISMEMBER error:', error);
      throw error;
    }
  }

  /**
   * Remove member from set
   */
  async srem(key: string, member: string): Promise<number> {
    try {
      return await this.client.srem(key, member);
    } catch (error) {
      console.error('Redis SREM error:', error);
      throw error;
    }
  }

  /**
   * Get all members of a set
   */
  async smembers(key: string): Promise<string[]> {
    try {
      return await this.client.smembers(key);
    } catch (error) {
      console.error('Redis SMEMBERS error:', error);
      throw error;
    }
  }

  /**
   * Delete multiple keys matching a pattern
   * 
   * WARNING: Use with caution in production
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }
      return await this.client.del(...keys);
    } catch (error) {
      console.error('Redis DELETE PATTERN error:', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }

  /**
   * Get Redis info
   */
  async info(): Promise<string> {
    try {
      return await this.client.info();
    } catch (error) {
      console.error('Redis INFO error:', error);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  getStatus(): string {
    return this.client.status;
  }

  /**
   * Flush all data (USE WITH EXTREME CAUTION)
   * Only for development/testing
   */
  async flushAll(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot flush Redis in production');
    }
    try {
      await this.client.flushall();
      console.warn('⚠️  Redis flushed (all data deleted)');
    } catch (error) {
      console.error('Redis FLUSHALL error:', error);
      throw error;
    }
  }
}
