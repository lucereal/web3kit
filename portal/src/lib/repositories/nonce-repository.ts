import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './base-repository';
import { Nonce, NonceInsert, NonceUpdate, NonceHelpers } from '../models/nonce';
import { INonceRepository } from './types';

export class NonceRepository extends BaseRepository<Nonce, NonceInsert, NonceUpdate> 
  implements INonceRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase, 'auth_nonces');
  }

  async findByWalletAddress(walletAddress: string): Promise<Nonce | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Failed to find nonce by wallet address: ${error.message}`);
    }

    return data as Nonce;
  }

  async storeNonce(walletAddress: string, nonce: string): Promise<Nonce> {
    const expiresAt = NonceHelpers.getExpiryTimestamp();
    
    // Use upsert to handle cases where a nonce already exists for this address
    const { data, error } = await this.supabase
      .from(this.tableName)
      .upsert({
        wallet_address: walletAddress.toLowerCase(),
        nonce,
        expires_at: expiresAt,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'wallet_address'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to store nonce: ${error.message}`);
    }

    return data as Nonce;
  }

  async getNonceIfValid(walletAddress: string): Promise<string | null> {
    const nonceData = await this.findByWalletAddress(walletAddress);
    
    if (!nonceData) {
      return null;
    }

    // Check if nonce has expired
    if (NonceHelpers.isExpired(nonceData)) {
      // Clean up expired nonce
      await this.deleteByWalletAddress(walletAddress);
      return null;
    }

    return nonceData.nonce;
  }

  async deleteByWalletAddress(walletAddress: string): Promise<boolean> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('wallet_address', walletAddress.toLowerCase());

    if (error) {
      console.error('Failed to delete nonce:', error.message);
      return false;
    }

    return true;
  }

  async cleanupExpiredNonces(): Promise<number> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id');

    if (error) {
      console.error('Failed to cleanup expired nonces:', error.message);
      return 0;
    }

    return data?.length || 0;
  }

  async findExpiredNonces(): Promise<Nonce[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .lt('expires_at', new Date().toISOString());

    if (error) {
      throw new Error(`Failed to find expired nonces: ${error.message}`);
    }

    return data as Nonce[];
  }
}
