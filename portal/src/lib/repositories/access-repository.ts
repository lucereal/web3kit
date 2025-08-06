import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './base-repository';
import { AccessInsert, Access, AccessUpdate } from '../models/access';
import { IAccessRepository } from './types';

export class AccessRepository extends BaseRepository<Access, AccessInsert, AccessUpdate> 
  implements IAccessRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase, 'access_meta');
  }

  /**
   * Find access by resource ID and buyer wallet
   */
  async findByResourceAndBuyer(resourceId: string, buyerWallet: string): Promise<Access | null> {
    return this.findFirst({
      resource_id: resourceId,
      buyer_wallet: buyerWallet.toLowerCase()
    } as Partial<Access>);
  }

  /**
   * Find all active access records for a buyer
   */
  async findActiveAccessByBuyer(buyerWallet: string): Promise<Access[]> {
    const now = Math.floor(Date.now() / 1000);
    
    return this.executeQuery(client => 
      client
        .from(this.tableName)
        .select('*')
        .eq('buyer_wallet', buyerWallet.toLowerCase())
        .gt('expires_at', now)
        .gt('usage_limit', 0)
    );
  }

  /**
   * Find all access records for a resource
   */
  async findByResource(resourceId: string): Promise<Access[]> {
    return this.findMany({ resource_id: resourceId } as Partial<Access>);
  }

  /**
   * Find active access records for a resource
   */
  async findActiveAccessByResource(resourceId: string): Promise<Access[]> {
    const now = Math.floor(Date.now() / 1000);
    
    return this.executeQuery(client => 
      client
        .from(this.tableName)
        .select('*')
        .eq('resource_id', resourceId)
        .gt('expires_at', now)
        .gt('usage_limit', 0)
    );
  }

  /**
   * Decrement usage for an access record
   */
  async decrementUsage(resourceId: string, buyerWallet: string, amount = 1): Promise<Access | null> {
    const access = await this.findByResourceAndBuyer(resourceId, buyerWallet);
    
    if (!access || access.usage_limit < amount) {
      return null;
    }

    return this.update(access.id!, {
      usage_limit: access.usage_limit - amount
    });
  }

  /**
   * Extend access (add usage or time)
   */
  async extendAccess(
    resourceId: string, 
    buyerWallet: string, 
    additionalUsage: number, 
    newExpiresAt?: number
  ): Promise<Access | null> {
    const access = await this.findByResourceAndBuyer(resourceId, buyerWallet);
    
    if (!access) {
      return null;
    }

    const updateData: AccessUpdate = {
      usage_limit: access.usage_limit + additionalUsage
    };

    if (newExpiresAt) {
      updateData.expires_at = Math.max(access.expires_at, newExpiresAt);
    }

    return this.update(access.id!, updateData);
  }

  /**
   * Create or extend access (useful for handling blockchain events)
   */
  async createOrExtendAccess(
    resourceId: string,
    buyerWallet: string,
    usage: number,
    expiresAt: number
  ): Promise<Access> {
    const existing = await this.findByResourceAndBuyer(resourceId, buyerWallet);

    if (existing) {
      // Extend existing access
      const updatedAccess = await this.extendAccess(
        resourceId,
        buyerWallet,
        usage,
        expiresAt
      );
      return updatedAccess!;
    } else {
      // Create new access
      return this.create({
        resource_id: resourceId,
        buyer_wallet: buyerWallet.toLowerCase(),
        usage_limit: usage,
        expires_at: expiresAt,
        amount_paid_wei: '0',
        purchased_at: Math.floor(Date.now() / 1000)
      });
    }
  }

  /**
   * Get expired access records (for cleanup)
   */
  async findExpiredAccess(beforeTimestamp?: number): Promise<Access[]> {
    const timestamp = beforeTimestamp || Math.floor(Date.now() / 1000);
    
    return this.executeQuery(client => 
      client
        .from(this.tableName)
        .select('*')
        .lt('expires_at', timestamp)
    );
  }

  /**
   * Clean up expired access records
   */
  async cleanupExpiredAccess(beforeTimestamp?: number): Promise<number> {
    const timestamp = beforeTimestamp || Math.floor(Date.now() / 1000);
    
    const { count, error } = await this.supabase
      .from(this.tableName)
      .delete({ count: 'exact' })
      .lt('expires_at', timestamp);

    if (error) {
      throw new Error(`Failed to cleanup expired access: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Get access statistics for a resource
   */
  async getResourceAccessStats(resourceId: string): Promise<{
    total: number;
    active: number;
    expired: number;
    totalUsageConsumed: number;
  }> {
    const allAccess = await this.findByResource(resourceId);
    const now = Math.floor(Date.now() / 1000);
    
    const stats = allAccess.reduce((acc, access) => {
      acc.total++;
      
      if (access.expires_at > now && access.usage_limit > 0) {
        acc.active++;
      } else {
        acc.expired++;
      }
      
      return acc;
    }, {
      total: 0,
      active: 0,
      expired: 0,
      totalUsageConsumed: 0
    });

    return stats;
  }
}
