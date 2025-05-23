import Redis from 'ioredis';
import { ICacheService } from './cache-service';
import { MemoryCacheService } from './memory-cache';
import { RedisCacheService } from './redis-cache';

// Cache factory
export enum CacheType {
  MEMORY = 'memory',
  REDIS = 'redis',
}

export interface CacheConfig {
  type: CacheType;
  redis?: Redis;
}

export class CacheFactory {
  static create(config: CacheConfig): ICacheService {
    switch (config.type) {
      case CacheType.MEMORY:
        return new MemoryCacheService();
      case CacheType.REDIS:
        if (!config.redis) {
          throw new Error('Redis instance required for Redis cache');
        }
        return new RedisCacheService(config.redis);
      default:
        throw new Error(`Unsupported cache type: ${config.type}`);
    }
  }
}

export const cacheService = CacheFactory.create({
  type: CacheType.MEMORY,
});
