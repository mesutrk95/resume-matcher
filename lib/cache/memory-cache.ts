// Memory cache implementation
import NodeCache from 'node-cache';
import { ICacheService } from './cache-service';

export class MemoryCacheService implements ICacheService {
  private cache: NodeCache;

  constructor(stdTTL: number = 0) {
    this.cache = new NodeCache({ stdTTL });
  }

  async get(key: string): Promise<string | null> {
    const value = this.cache.get<string>(key);
    return value !== undefined ? value : null;
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      this.cache.set(key, value, ttl);
    } else {
      this.cache.set(key, value);
    }
  }

  async delete(key: string): Promise<boolean> {
    return this.cache.del(key) > 0;
  }

  async getObject<T>(key: string): Promise<T | null> {
    const value = this.cache.get<T>(key);
    return value !== undefined ? value : null;
  }

  async setObject<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (ttl) {
      this.cache.set(key, value, ttl);
    } else {
      this.cache.set(key, value);
    }
  }
}
