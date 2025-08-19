import { Access, AccessInsert, AccessUpdate } from '../models/access';
import { Resource, ResourceInsert, ResourceUpdate } from '../models/resource';
import { Nonce, NonceInsert, NonceUpdate } from '../models/nonce';

/**
 * Interface for nonce repository operations
 */
export interface INonceRepository {
  findByWalletAddress(walletAddress: string): Promise<Nonce | null>;
  storeNonce(walletAddress: string, nonce: string): Promise<Nonce>;
  getNonceIfValid(walletAddress: string): Promise<string | null>;
  deleteByWalletAddress(walletAddress: string): Promise<boolean>;
  cleanupExpiredNonces(): Promise<number>;
  findExpiredNonces(): Promise<Nonce[]>;
  create(data: NonceInsert): Promise<Nonce>;
  update(id: string, data: NonceUpdate): Promise<Nonce | null>;
  findMany(filters?: Partial<Nonce>): Promise<Nonce[]>;
}

/**
 * Interface for access repository operations
 */
export interface IAccessRepository {
  findByResourceAndBuyer(resourceId: string, buyerWallet: string): Promise<Access | null>;
  findActiveAccessByBuyer(buyerWallet: string): Promise<Access[]>;
  findByResource(resourceId: string): Promise<Access[]>;
  findActiveAccessByResource(resourceId: string): Promise<Access[]>;
  createAccess(resourceId: string, buyerWallet: string, amount_paid_wei: string, purchased_at: number): Promise<Access>;
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
  findActiveResources(limit?: number, offset?: number): Promise<Resource[]>;
  deactivateResource(resourceId: string): Promise<Resource | null>;
  findResourcesWithFilters(filters: {
    serviceId?: number;
    minPriceWei?: string;
    maxPriceWei?: string;
    sellerWallet?: string;
    isActive?: boolean;
  }, limit?: number, offset?: number): Promise<Resource[]>;
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
  nonce: INonceRepository;
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