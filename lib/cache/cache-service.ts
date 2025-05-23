// Cache interface
export interface ICacheService {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;

  getObject<T>(key: string): Promise<T | null>;
  setObject<T>(key: string, value: T, ttl?: number): Promise<void>;
}
