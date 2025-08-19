export interface Nonce {
  id?: string;
  wallet_address: string;
  nonce: string;
  expires_at: string; // ISO string
  created_at?: string; // ISO string
}

export interface NonceInsert extends Omit<Nonce, 'id' | 'created_at'> {}

export interface NonceUpdate extends Partial<Omit<Nonce, 'id' | 'created_at'>> {}

// Helper functions for working with Nonces
export const NonceHelpers = {
  /**
   * Check if nonce has expired
   */
  isExpired(nonce: Nonce): boolean {
    return new Date(nonce.expires_at).getTime() < Date.now();
  },

  /**
   * Get expiry timestamp for a new nonce (5 minutes from now)
   */
  getExpiryTimestamp(): string {
    return new Date(Date.now() + (5 * 60 * 1000)).toISOString();
  },

  /**
   * Create key for Redis caching (if needed)
   */
  getCacheKey(walletAddress: string): string {
    return `nonce:${walletAddress.toLowerCase()}`;
  }
};
