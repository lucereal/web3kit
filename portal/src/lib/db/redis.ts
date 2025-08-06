import { Redis } from '@upstash/redis';
import { ICacheStore } from '../repositories/types';


/**
 * Cache Service - Handles all Redis caching operations
 */
export class CacheService implements ICacheStore {
  private static instance: CacheService;
  private redis: Redis;

  private constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Access cache operations
   */
  async setAccessCache(resourceId: string, buyerWallet: string, data: {
    usageLeft: number;
    expiresAt: number;
  }): Promise<void> {
    const cacheKey = this.getAccessCacheKey(resourceId, buyerWallet);
    await this.redis.set(cacheKey, data);
  }

  async getAccessCache(resourceId: string, buyerWallet: string): Promise<{
    usageLeft: number;
    expiresAt: number;
  } | null> {
    const cacheKey = this.getAccessCacheKey(resourceId, buyerWallet);
    const cached = await this.redis.get(cacheKey);
    
    if (cached && typeof cached === 'object' && 'usageLeft' in cached && 'expiresAt' in cached) {
      return cached as { usageLeft: number; expiresAt: number };
    }
    
    return null;
  }

  async deleteAccessCache(resourceId: string, buyerWallet: string): Promise<void> {
    const cacheKey = this.getAccessCacheKey(resourceId, buyerWallet);
    await this.redis.del(cacheKey);
  }

  /**
   * General cache operations
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.set(key, value, { ex: ttl });
    } else {
      await this.redis.set(key, value);
    }
  }

  async get(key: string): Promise<any> {
    return await this.redis.get(key);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  /**
   * Helper methods
   */
  private getAccessCacheKey(resourceId: string, buyerWallet: string): string {
    return `access:${resourceId}:${buyerWallet.toLowerCase()}`;
  }

  /**
   * Direct Redis client access (if needed)
   */
  get client(): Redis {
    return this.redis;
  }

  /**
   * Test Redis connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (err) {
      console.error('Redis connection test failed:', err);
      return false;
    }
  }
}

// Export singleton instance
export const cacheService = CacheService.getInstance();

// Export default instance for backward compatibility
export default cacheService;
