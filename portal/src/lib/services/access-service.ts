import { Access, AccessHelpers } from '../models/access';
import { Resource, ResourceHelpers } from '../models/resource';
import { ICacheStore } from '../repositories/types';
import { IRepositoryFactory } from '../repositories/types';
import { RepositoryFactory } from '../db/supabase';
import { CacheService } from '../db/redis';


export class AccessService {
  private cacheStore: ICacheStore;
  private repositories: IRepositoryFactory;

  constructor(cacheStore: ICacheStore, repositories: IRepositoryFactory) {
    this.cacheStore = cacheStore;
    this.repositories = repositories;
  }

  static create(): AccessService {
    const repositories = RepositoryFactory.getInstance();
    const cacheService = CacheService.getInstance();
    
    return new AccessService(cacheService, repositories);
  }

  async grantAccess(
    resourceId: string,
    buyerWallet: string,
    amount_paid_wei: string,
    purchased_at: number
  ): Promise<Access> {
    // Update database
    const access = await this.repositories.access.createAccess(
      resourceId,
      buyerWallet,
      amount_paid_wei,
      purchased_at
    );

    // // Update Redis cache
    // await this.cacheStore.setAccessCache(resourceId, buyerWallet, {
    //   usageLeft: access.usage_limit,
    //   expiresAt: access.expires_at
    // });

    return access;
  }
  
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
      is_active: true
    });
  }

  async getAccessInfo(resourceId: string, buyerWallet: string): Promise<Access | null> {
    return this.repositories.access.findByResourceAndBuyer(resourceId, buyerWallet);
  }

  async getBuyerActiveAccess(buyerWallet: string): Promise<Access[]> {
    return this.repositories.access.findActiveAccessByBuyer(buyerWallet);
  }

  async getResourceAccess(resourceId: string): Promise<Access[]> {
    return this.repositories.access.findByResource(resourceId);
  }
}
