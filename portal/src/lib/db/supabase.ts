import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AccessRepository } from '../repositories/access-repository';
import { ResourceRepository } from '../repositories/resource-repository';
import { NonceRepository } from '../repositories/nonce-repository';
import { IRepositoryFactory } from '../repositories/types';


const SUPABASE_URL: string = process.env.SUPABASE_URL as string;
const SUPABASE_KEY: string = process.env.SUPABASE_KEY as string;

// Create singleton Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Repository Factory - Provides access to all repositories
 */
export class RepositoryFactory implements IRepositoryFactory {
  private static instance: RepositoryFactory;
  private supabaseClient: SupabaseClient;
  
  // Repository instances
  private _accessRepository?: AccessRepository;
  private _resourceRepository?: ResourceRepository;
  private _nonceRepository?: NonceRepository;

  private constructor() {
    this.supabaseClient = supabase;
  }

  public static getInstance(): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory();
    }
    return RepositoryFactory.instance;
  }

  // Lazy-loaded repository getters
  get access(): AccessRepository {
    if (!this._accessRepository) {
      this._accessRepository = new AccessRepository(this.supabaseClient);
    }
    return this._accessRepository;
  }

  get resource(): ResourceRepository {
    if (!this._resourceRepository) {
      this._resourceRepository = new ResourceRepository(this.supabaseClient);
    }
    return this._resourceRepository;
  }

  get nonce(): NonceRepository {
    if (!this._nonceRepository) {
      this._nonceRepository = new NonceRepository(this.supabaseClient);
    }
    return this._nonceRepository;
  }

  // Direct access to client if needed
  get supabase(): SupabaseClient {
    return this.supabaseClient;
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const { error } = await this.supabaseClient
        .from('access_meta')
        .select('id')
        .limit(1);
      
      return !error;
    } catch (err) {
      console.error('Database connection test failed:', err);
      return false;
    }
  }

  /**
   * Execute raw SQL query (for complex operations)
   */
  async executeRawQuery<T = any>(query: string, params?: any[]): Promise<T> {
    const { data, error } = await this.supabaseClient.rpc('execute_sql', {
      query,
      params: params || []
    });

    if (error) {
      throw new Error(`Raw query failed: ${error.message}`);
    }

    return data as T;
  }
}

// Export singleton instance
export const repositories = RepositoryFactory.getInstance();

// Export individual repositories for convenience
export const accessRepository = repositories.access;
export const resourceRepository = repositories.resource;
export const nonceRepository = repositories.nonce;

// Export client
export { supabase };

// Export default instance for backward compatibility
export default repositories;