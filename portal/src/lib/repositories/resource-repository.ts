import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './base-repository';
import { Resource, ResourceInsert, ResourceUpdate } from '../models/resource';
import { IResourceRepository } from './types';

export class ResourceRepository extends BaseRepository<Resource, ResourceInsert, ResourceUpdate> 
  implements IResourceRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase, 'resource_meta');
  }

  async findByResourceId(resourceId: string): Promise<Resource | null> {
    return this.findFirst({ resource_id: resourceId } as Partial<Resource>);
  }

  async findBySeller(sellerWallet: string): Promise<Resource[]> {
    return this.findMany({ seller_wallet: sellerWallet.toLowerCase() } as Partial<Resource>);
  }

  async findActiveResourcesBySeller(sellerWallet: string): Promise<Resource[]> {
    return this.executeQuery(client => 
      client
        .from(this.tableName)
        .select('*')
        .eq('seller_wallet', sellerWallet.toLowerCase())
        .eq('is_active', true)
    );
  }

  async findByServiceId(serviceId: string): Promise<Resource[]> {
    return this.findMany({ 
      service_id: serviceId,
      is_active: true 
    } as Partial<Resource>);
  }

  async findByResourceType(resourceType: number): Promise<Resource[]> {
    return this.findMany({
      resource_type: resourceType,
      is_active: true 
    } as Partial<Resource>);
  }

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

  async deactivateResource(resourceId: string): Promise<Resource | null> {
    const resource = await this.findByResourceId(resourceId);
    if (!resource) return null;

    return this.update(resource.id!, { is_active: false });
  }

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

  async deactivate(id: string): Promise<Resource | null> {
    return this.update(id, {
      is_active: false
    });
  }
}
