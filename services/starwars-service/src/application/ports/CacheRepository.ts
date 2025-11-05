export interface CacheRepository {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
}
