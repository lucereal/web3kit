import { nonceRepository } from '@/lib/db/supabase';

interface NonceData {
  nonce: string;
  expiresAt: number;
}

export class NonceService {
  private static instance: NonceService;

  private constructor() {}

  public static getInstance(): NonceService {
    if (!NonceService.instance) {
      NonceService.instance = new NonceService();
    }
    return NonceService.instance;
  }

  /**
   * Store a nonce for a wallet address
   */
  async storeNonce(address: string, nonce: string): Promise<void> {
    await nonceRepository.storeNonce(address, nonce);
  }

  /**
   * Retrieve and validate a nonce for a wallet address
   */
  async getNonce(address: string): Promise<NonceData | null> {
    const nonce = await nonceRepository.getNonceIfValid(address);
    
    if (!nonce) {
      return null;
    }

    // For backward compatibility, we need to return expiresAt
    // Since the repository handles expiry validation, we can use a dummy value
    return {
      nonce,
      expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes from now
    };
  }

  /**
   * Delete a nonce after it's been used or expired
   */
  async deleteNonce(address: string): Promise<void> {
    await nonceRepository.deleteByWalletAddress(address);
  }

  /**
   * Clean up all expired nonces (can be called periodically)
   */
  async cleanupExpiredNonces(): Promise<void> {
    const deletedCount = await nonceRepository.cleanupExpiredNonces();
    console.log(`Cleaned up ${deletedCount} expired nonces`);
  }
}

// Export singleton instance
export const nonceService = NonceService.getInstance();
