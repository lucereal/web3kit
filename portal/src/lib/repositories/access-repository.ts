import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './base-repository';
import { AccessInsert, Access, AccessUpdate } from '../models/access';
import { IAccessRepository } from './types';

export class AccessRepository extends BaseRepository<Access, AccessInsert, AccessUpdate> 
  implements IAccessRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase, 'access_meta');
  }

  async findByResourceAndBuyer(resourceId: string, buyerWallet: string): Promise<Access | null> {
    return this.findFirst({
      resource_id: resourceId,
      buyer_wallet: buyerWallet.toLowerCase()
    } as Partial<Access>);
  }

  async findActiveAccessByBuyer(buyerWallet: string): Promise<Access[]> {
    const now = Math.floor(Date.now() / 1000);
    
    return this.executeQuery(client => 
      client
        .from(this.tableName)
        .select('*')
        .eq('buyer_wallet', buyerWallet.toLowerCase())
        .gt('is_active', true)
    );
  }

  async findByResource(resourceId: string): Promise<Access[]> {
    return this.findMany({ resource_id: resourceId } as Partial<Access>);
  }

  async findActiveAccessByResource(resourceId: string): Promise<Access[]> {
    const now = Math.floor(Date.now() / 1000);
    
    return this.executeQuery(client => 
      client
        .from(this.tableName)
        .select('*')
        .eq('resource_id', resourceId)
        .gt('is_active', true)
    );
  }

  async createAccess(
    resourceId: string,
    buyerWallet: string,
    amount_paid_wei: string,
    purchased_at: number
  ): Promise<Access> {
    const existing = await this.findByResourceAndBuyer(resourceId, buyerWallet);

    return this.create({
      resource_id: resourceId,
      buyer_wallet: buyerWallet.toLowerCase(),
      amount_paid_wei: amount_paid_wei,
      purchased_at: purchased_at
    });
    
  }

}
