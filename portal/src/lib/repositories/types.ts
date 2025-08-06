import { Access, AccessInsert, AccessUpdate } from '../models/access';
import { Resource, ResourceInsert, ResourceUpdate } from '../models/resource';

/**
 * Interface for access repository operations
 */
export interface IAccessRepository {
  findByResourceAndBuyer(resourceId: string, buyerWallet: string): Promise<Access | null>;
  findActiveAccessByBuyer(buyerWallet: string): Promise<Access[]>;
  findByResource(resourceId: string): Promise<Access[]>;
  findActiveAccessByResource(resourceId: string): Promise<Access[]>;
  decrementUsage(resourceId: string, buyerWallet: string, amount?: number): Promise<Access | null>;
  createOrExtendAccess(resourceId: string, buyerWallet: string, usage: number, expiresAt: number): Promise<Access>;
  findExpiredAccess(beforeTimestamp?: number): Promise<Access[]>;
  cleanupExpiredAccess(beforeTimestamp?: number): Promise<number>;
  getResourceAccessStats(resourceId: string): Promise<{ total: number; active: number; expired: number; totalUsageConsumed: number; }>;
  create(data: AccessInsert): Promise<Access>;
  update(id: string, data: AccessUpdate): Promise<Access | null>;
  findMany(filters?: Partial<Access>): Promise<Access[]>;
}

/**
 * Interface for resource repository operations
 */
export interface IResourceRepository {
  findByResourceId(resourceId: string): Promise<Resource | null>;
  findBySeller(sellerWallet: string): Promise<Resource[]>;
  findActiveResourcesBySeller(sellerWallet: string): Promise<Resource[]>;
  findByServiceId(serviceId: string): Promise<Resource[]>;
  findByResourceType(resourceType: number): Promise<Resource[]>;
  searchResources(query: string, limit?: number): Promise<Resource[]>;
  findResourcesWithFilters(filters: any, limit?: number, offset?: number): Promise<Resource[]>;
  softDelete(id: string): Promise<Resource | null>;
  deactivate(id: string): Promise<Resource | null>;
  create(data: ResourceInsert): Promise<Resource>;
  update(id: string, data: ResourceUpdate): Promise<Resource | null>;
  findMany(filters?: Partial<Resource>): Promise<Resource[]>;
}

/**
 * Interface for repository factory
 */
export interface IRepositoryFactory {
  access: IAccessRepository;
  resource: IResourceRepository;
  testConnection(): Promise<boolean>;
}

export interface ICacheStore {
  // Access cache operations
  setAccessCache(resourceId: string, buyerWallet: string, data: {
    usageLeft: number;
    expiresAt: number;
  }): Promise<void>;

  getAccessCache(resourceId: string, buyerWallet: string): Promise<{
    usageLeft: number;
    expiresAt: number;
  } | null>;

  deleteAccessCache(resourceId: string, buyerWallet: string): Promise<void>;

  // General cache operations
  set(key: string, value: any, ttl?: number): Promise<void>;
  get(key: string): Promise<any>;
  del(key: string): Promise<void>;

  // Utility
  testConnection(): Promise<boolean>;
}