import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './base-repository';
import { Resource, ResourceInsert, ResourceUpdate } from '../models/resource';
import { IResourceRepository } from './types';

export class ResourceRepository extends BaseRepository<Resource, ResourceInsert, ResourceUpdate> 
  implements IResourceRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase, 'resource_meta');
  }

  /**
   * Find resource by resource ID (from blockchain)
   */
  async findByResourceId(resourceId: string): Promise<Resource | null> {
    return this.findFirst({ resource_id: resourceId } as Partial<Resource>);
  }

  /**
   * Find resources by seller wallet
   */
  async findBySeller(sellerWallet: string): Promise<Resource[]> {
    return this.findMany({ seller_wallet: sellerWallet.toLowerCase() } as Partial<Resource>);
  }

  /**
   * Find active resources by seller
   */
  async findActiveResourcesBySeller(sellerWallet: string): Promise<Resource[]> {
    return this.executeQuery(client => 
      client
        .from(this.tableName)
        .select('*')
        .eq('seller_wallet', sellerWallet.toLowerCase())
        .eq('is_active', true)
    );
  }

  /**
   * Find resources by service ID
   */
  async findByServiceId(serviceId: string): Promise<Resource[]> {
    return this.findMany({ 
      service_id: serviceId,
      is_active: true 
    } as Partial<Resource>);
  }

  /**
   * Find resources by type
   */
  async findByResourceType(resourceType: number): Promise<Resource[]> {
    return this.findMany({
      resource_type: resourceType,
      is_active: true 
    } as Partial<Resource>);
  }

  /**
   * Search resources by name or description
   */
  async searchResources(query: string, limit = 20): Promise<Resource[]> {
    return this.executeQuery(client => 
      client
        .from(this.tableName)
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit)
    );
  }

  /**
   * Get all active resources (marketplace listings)
   */
  async findActiveResources(limit = 100, offset = 0): Promise<Resource[]> {
    return this.executeQuery(client => 
      client
        .from(this.tableName)
        .select('*')
        .eq('is_active', true)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })
    );
  }

  /**
   * Deactivate a resource
   */
  async deactivateResource(resourceId: string): Promise<Resource | null> {
    const resource = await this.findByResourceId(resourceId);
    if (!resource) return null;

    return this.update(resource.id!, { is_active: false });
  }

  /**
   * Activate a resource
   */
  async activateResource(resourceId: string): Promise<Resource | null> {
    const resource = await this.findByResourceId(resourceId);
    if (!resource) return null;

    return this.update(resource.id!, { is_active: true });
  }

  /**
   * Update resource pricing
   */
  async updateResourcePrice(resourceId: string, newPriceWei: string): Promise<Resource | null> {
    const resource = await this.findByResourceId(resourceId);
    if (!resource) return null;

    return this.update(resource.id!, { price_wei: newPriceWei });
  }

  /**
   * Update resource defaults (usage and expiry)
   */
  async updateResourceDefaults(
    resourceId: string, 
    defaultUsage: number, 
    defaultExpirySeconds: number
  ): Promise<Resource | null> {
    const resource = await this.findByResourceId(resourceId);
    if (!resource) return null;

    return this.update(resource.id!, {
      default_usage: defaultUsage,
      default_expiry_seconds: defaultExpirySeconds
    });
  }


  /**
   * Get trending resources (most accessed recently)
   * This would require joining with access_meta table
   */
  async getTrendingResources(limit = 10): Promise<Resource[]> {
    // This is a complex query that joins with access_meta
    // For now, return active resources ordered by creation date
    // In a more sophisticated implementation, you'd track access counts
    return this.executeQuery(client => 
      client
        .from(this.tableName)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit)
    );
  }

  /**
   * Get resources with filters and pagination
   */
  async findResourcesWithFilters(filters: {
    serviceId?: number;
    minPriceWei?: string;
    maxPriceWei?: string;
    sellerWallet?: string;
    isActive?: boolean;
  }, limit = 20, offset = 0): Promise<Resource[]> {
    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .range(offset, offset + limit - 1);

    if (filters.serviceId !== undefined) {
      query = query.eq('service_id', filters.serviceId);
    }

    if (filters.sellerWallet) {
      query = query.eq('seller_wallet', filters.sellerWallet.toLowerCase());
    }

    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    if (filters.minPriceWei) {
      query = query.gte('price_wei', filters.minPriceWei);
    }

    if (filters.maxPriceWei) {
      query = query.lte('price_wei', filters.maxPriceWei);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to find resources with filters: ${error.message}`);
    }

    return data as Resource[];
  }

  /**
   * Soft delete a resource
   */
  async softDelete(id: string): Promise<Resource | null> {
    return this.update(id, {
      is_deleted: true,
      deleted_at: Math.floor(Date.now() / 1000)
    });
  }

  /**
   * Deactivate a resource
   */
  async deactivate(id: string): Promise<Resource | null> {
    return this.update(id, {
      is_active: false,
      deactivated_at: Math.floor(Date.now() / 1000)
    });
  }
}
