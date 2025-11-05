import Redis from "ioredis";
import { config } from "../../config.js";
import type { CacheRepository } from "../../application/ports/CacheRepository.js";

export class RedisCacheRepository implements CacheRepository {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: config.redis.db,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    try {
      await this.client.setex(key, ttlSeconds, value);
    } catch (error) {
      console.error(`Error setting cache key ${key}:`, error);
    }
  }

  async close(): Promise<void> {
    await this.client.quit();
  }
}
