import { Access, AccessHelpers } from '../models/access';
import { Resource, ResourceHelpers } from '../models/resource';
import { ICacheStore } from '../repositories/types';
import { IRepositoryFactory } from '../repositories/types';
import { RepositoryFactory } from '../db/supabase';
import { CacheService } from '../db/redis';


/**
 * Access Service - Handles business logic for access management
 * Combines database operations with Redis caching
 */
export class AccessService {
  private cacheStore: ICacheStore;
  private repositories: IRepositoryFactory;

  constructor(cacheStore: ICacheStore, repositories: IRepositoryFactory) {
    this.cacheStore = cacheStore;
    this.repositories = repositories;
  }

  /**
   * Factory method to create AccessService with real production stores
   */
  static create(): AccessService {
    const repositories = RepositoryFactory.getInstance();
    const cacheService = CacheService.getInstance();
    
    return new AccessService(cacheService, repositories);
  }


  /**
   * Grant access to a buyer for a resource
   * This is typically called from blockchain event handlers
   */
  async grantAccess(
    resourceId: string,
    buyerWallet: string,
    usage: number,
    expiresAt: number
  ): Promise<Access> {
    // Update database
    const access = await this.repositories.access.createOrExtendAccess(
      resourceId,
      buyerWallet,
      usage,
      expiresAt
    );

    // Update Redis cache
    await this.cacheStore.setAccessCache(resourceId, buyerWallet, {
      usageLeft: access.usage_limit,
      expiresAt: access.expires_at
    });

    return access;
  }

  /**
   * Check if a buyer has valid access to a resource
   * First checks Redis cache, then database if needed
   */
  async hasValidAccess(resourceId: string, buyerWallet: string): Promise<{
    hasAccess: boolean;
    access?: Access;
    usageLeft?: number;
    expiresAt?: number;
  }> {
    // Try cache first
    const cached = await this.cacheStore.getAccessCache(resourceId, buyerWallet);
    if (cached) {
      const isValid = cached.usageLeft > 0 && cached.expiresAt > Math.floor(Date.now() / 1000);
      
      return {
        hasAccess: isValid,
        usageLeft: cached.usageLeft,
        expiresAt: cached.expiresAt
      };
    }

    // Fallback to database
    const access = await this.repositories.access.findByResourceAndBuyer(resourceId, buyerWallet);
    if (!access) {
      return { hasAccess: false };
    }

    const isValid = AccessHelpers.isValidAccess(access);
    
    // Update cache with database result
    if (isValid) {
      await this.cacheStore.setAccessCache(resourceId, buyerWallet, {
        usageLeft: access.usage_limit,
        expiresAt: access.expires_at
      });
    }

    return {
      hasAccess: isValid,
      access,
      usageLeft: access.usage_limit,
      expiresAt: access.expires_at
    };
  }

  /**
   * Consume usage for a resource access
   * Updates both cache and database
   */
  async consumeUsage(resourceId: string, buyerWallet: string, amount = 1): Promise<{
    success: boolean;
    remainingUsage?: number;
    access?: Access;
  }> {
    // Get current access state
    const { hasAccess, usageLeft } = await this.hasValidAccess(resourceId, buyerWallet);
    
    if (!hasAccess || !usageLeft || usageLeft < amount) {
      return { success: false };
    }

    // Update database
    const updatedAccess = await this.repositories.access.decrementUsage(resourceId, buyerWallet, amount);
    if (!updatedAccess) {
      return { success: false };
    }

    // Update cache
    await this.cacheStore.setAccessCache(resourceId, buyerWallet, {
      usageLeft: updatedAccess.usage_limit,
      expiresAt: updatedAccess.expires_at
    });

    return {
      success: true,
      remainingUsage: updatedAccess.usage_limit,
      access: updatedAccess
    };
  }

  /**
   * Create a new resource
   */
  async createResource(
    resourceId: string,
    sellerWallet: string,
    name: string,
    description: string,
    priceWei: string,
    serviceId: string,
    resourceType: number,
    cid: string,
    url: string,
    defaultUsage: number,
    defaultExpirySeconds: number
  ): Promise<Resource> {
    return this.repositories.resource.create({
      resource_id: resourceId,
      seller_wallet: sellerWallet.toLowerCase(),
      name,
      description,
      price_wei: priceWei,
      service_id: serviceId,
      resource_type: resourceType,
      cid,
      url,
      default_usage: defaultUsage,
      default_expiry_seconds: defaultExpirySeconds,
      is_active: true,
      is_deleted: false
    });
  }

  /**
   * Get access information for a buyer
   */
  async getAccessInfo(resourceId: string, buyerWallet: string): Promise<Access | null> {
    return this.repositories.access.findByResourceAndBuyer(resourceId, buyerWallet);
  }

  /**
   * Get all active access for a buyer
   */
  async getBuyerActiveAccess(buyerWallet: string): Promise<Access[]> {
    return this.repositories.access.findActiveAccessByBuyer(buyerWallet);
  }

  /**
   * Get all access for a resource (for resource owners)
   */
  async getResourceAccess(resourceId: string): Promise<Access[]> {
    return this.repositories.access.findByResource(resourceId);
  }

  /**
   * Clean up expired access and cache
   */
  async cleanupExpiredAccess(): Promise<number> {
    const expiredAccess = await this.repositories.access.findExpiredAccess();
    
    // Remove from cache
    const cleanupPromises = expiredAccess.map((access: Access) => {
      return this.cacheStore.deleteAccessCache(access.resource_id, access.buyer_wallet);
    });
    
    await Promise.all(cleanupPromises);
    
    // Remove from database
    return this.repositories.access.cleanupExpiredAccess();
  }

  /**
   * Rebuild cache from database (recovery function)
   */
  async rebuildCache(resourceId?: string, buyerWallet?: string): Promise<void> {
    let accessRecords: Access[];
    
    if (resourceId && buyerWallet) {
      const access = await this.repositories.access.findByResourceAndBuyer(resourceId, buyerWallet);
      accessRecords = access ? [access] : [];
    } else if (resourceId) {
      accessRecords = await this.repositories.access.findActiveAccessByResource(resourceId);
    } else if (buyerWallet) {
      accessRecords = await this.repositories.access.findActiveAccessByBuyer(buyerWallet);
    } else {
      // Rebuild entire cache - be careful with this on large datasets
      accessRecords = await this.repositories.access.findMany();
    }

    const cacheUpdates = accessRecords
      .filter(access => AccessHelpers.isValidAccess(access))
      .map(access => {
        return this.cacheStore.setAccessCache(access.resource_id, access.buyer_wallet, {
          usageLeft: access.usage_limit,
          expiresAt: access.expires_at
        });
      });

    await Promise.all(cacheUpdates);
  }
}
