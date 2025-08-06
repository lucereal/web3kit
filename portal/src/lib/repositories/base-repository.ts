import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Generic repository interface for common CRUD operations
 */
export interface Repository<T, TInsert = Partial<T>, TUpdate = Partial<T>> {
  findById(id: string): Promise<T | null>;
  findMany(filter?: Partial<T>, limit?: number, offset?: number): Promise<T[]>;
  create(data: TInsert): Promise<T>;
  update(id: string, data: TUpdate): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  count(filter?: Partial<T>): Promise<number>;
}

/**
 * Base repository implementation with common CRUD operations
 */
export abstract class BaseRepository<T, TInsert = Partial<T>, TUpdate = Partial<T>> 
  implements Repository<T, TInsert, TUpdate> {
  
  protected supabase: SupabaseClient;
  protected tableName: string;

  constructor(supabase: SupabaseClient, tableName: string) {
    this.supabase = supabase;
    this.tableName = tableName;
  }

  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Failed to find ${this.tableName} by id: ${error.message}`);
    }

    return data as T;
  }

  async findMany(filter?: Partial<T>, limit = 100, offset = 0): Promise<T[]> {
    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .range(offset, offset + limit - 1);

    // Apply filters
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to find ${this.tableName}: ${error.message}`);
    }

    return data as T[];
  }

  async create(data: TInsert): Promise<T> {
    const { data: created, error } = await this.supabase
      .from(this.tableName)
      .insert(data as any)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create ${this.tableName}: ${error.message}`);
    }

    return created as T;
  }

  async update(id: string, data: TUpdate): Promise<T | null> {
    const { data: updated, error } = await this.supabase
      .from(this.tableName)
      .update(data as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Failed to update ${this.tableName}: ${error.message}`);
    }

    return updated as T;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete ${this.tableName}: ${error.message}`);
    }

    return true;
  }

  async count(filter?: Partial<T>): Promise<number> {
    let query = this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true });

    // Apply filters
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to count ${this.tableName}: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Execute a custom query
   */
  protected async executeQuery<TResult = any>(
    queryBuilder: (client: SupabaseClient) => any
  ): Promise<TResult> {
    const { data, error } = await queryBuilder(this.supabase);

    if (error) {
      throw new Error(`Query failed: ${error.message}`);
    }

    return data as TResult;
  }

  /**
   * Find first record matching filter
   */
  async findFirst(filter: Partial<T>): Promise<T | null> {
    const results = await this.findMany(filter, 1, 0);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Check if record exists
   */
  async exists(filter: Partial<T>): Promise<boolean> {
    const count = await this.count(filter);
    return count > 0;
  }

  /**
   * Find or create a record
   */
  async findOrCreate(filter: Partial<T>, createData: TInsert): Promise<{ data: T; created: boolean }> {
    const existing = await this.findFirst(filter);
    
    if (existing) {
      return { data: existing, created: false };
    }

    const created = await this.create(createData);
    return { data: created, created: true };
  }

  /**
   * Batch operations
   */
  async createMany(data: TInsert[]): Promise<T[]> {
    const { data: created, error } = await this.supabase
      .from(this.tableName)
      .insert(data as any[])
      .select();

    if (error) {
      throw new Error(`Failed to create multiple ${this.tableName}: ${error.message}`);
    }

    return created as T[];
  }

  async deleteMany(filter: Partial<T>): Promise<number> {
    let query = this.supabase
      .from(this.tableName)
      .delete({ count: 'exact' });

    // Apply filters
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to delete multiple ${this.tableName}: ${error.message}`);
    }

    return count || 0;
  }
}
