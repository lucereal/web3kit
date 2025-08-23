// Basic Alchemy client setup for future use
// Currently not used - Etherscan direct logs API is the primary approach

import { EVENT_FETCHING_CONFIG } from '@/config/events'

/**
 * Simple Alchemy client for basic network operations
 * Kept for potential future use (e.g., getting latest network transactions)
 */
export class AlchemyClient {
  private readonly apiKey: string
  private readonly baseUrl: string

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || ''
    this.baseUrl = `https://eth-sepolia.g.alchemy.com/v2/${this.apiKey}`
    
    if (!this.apiKey) {
      console.warn('⚠️ NEXT_PUBLIC_ALCHEMY_API_KEY not found - Alchemy client disabled')
    }
  }

  /**
   * Get the latest block number from Alchemy
   */
  async getLatestBlockNumber(): Promise<number> {
    if (!this.apiKey) {
      throw new Error('Alchemy API key required')
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_blockNumber',
        params: []
      })
    })

    const data = await response.json()
    
    if (data.error) {
      throw new Error(`Alchemy error: ${data.error.message}`)
    }

    return parseInt(data.result, 16)
  }

  /**
   * Get basic network info (for future use)
   */
  async getNetworkInfo() {
    const latestBlock = await this.getLatestBlockNumber()
    
    return {
      latestBlock,
      maxBlocksPerRequest: EVENT_FETCHING_CONFIG.maxBlocksPerRequest,
      maxHistoricalBlocks: EVENT_FETCHING_CONFIG.maxHistoricalBlocks
    }
  }
}

// Export singleton instance for convenience
export const alchemyClient = new AlchemyClient()
