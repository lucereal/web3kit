export interface Access {
  id?: string;
  resource_id: string;
  buyer_wallet: string;
  usage_limit: number;
  amount_paid_wei: string; 
  purchased_at: number;
  expires_at: number;
  created_at?: number;
  updated_at?: number;
}

export interface AccessInsert extends Omit<Access, 'id' | 'created_at' | 'updated_at'> {}

export interface AccessUpdate extends Partial<Omit<Access, 'id' | 'created_at' | 'updated_at'>> {}

// Helper functions for working with AccessMeta
export const AccessHelpers = {
  /**
   * Check if access is still valid (not expired and has usage left)
   */
  isValidAccess(access: Access): boolean {
    const now = Math.floor(Date.now() / 1000);
    return access.usage_limit > 0 && access.expires_at > now;
  },

  /**
   * Get time remaining in seconds
   */
  getTimeRemaining(access: Access): number {
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, access.expires_at - now);
  },

  /**
   * Create key for Redis caching
   */
  getCacheKey(resourceId: string, buyerWallet: string): string {
    return `access:${resourceId}:${buyerWallet.toLowerCase()}`;
  }
};
