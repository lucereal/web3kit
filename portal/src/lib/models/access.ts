export interface Access {
  id?: string;
  resource_id: string;
  buyer_wallet: string;
  amount_paid_wei: string; 
  purchased_at: number;
}

export interface AccessInsert extends Omit<Access, 'id' | 'created_at'> {}

export interface AccessUpdate extends Partial<Omit<Access, 'id' | 'created_at'>> {}

// Helper functions for working with AccessMeta
export const AccessHelpers = {

  /**
   * Create key for Redis caching
   */
  getCacheKey(resourceId: string, buyerWallet: string): string {
    return `access:${resourceId}:${buyerWallet.toLowerCase()}`;
  }
};
