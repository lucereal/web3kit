export interface Resource {
  id?: string;
  resource_id: string;
  seller_wallet: string;
  service_id: string;
  resource_type: number;
  name: string;
  description: string;
  cid?: string;
  url?: string;
  price_wei: string;
  is_active: boolean;
  created_at?: number;
}

export interface ResourceInsert extends Omit<Resource, 'id' | 'created_at'> {}

export interface ResourceUpdate extends Partial<Omit<Resource, 'id' | 'created_at'>> {}

// Helper functions for working with ResourceMeta
export const ResourceHelpers = {
  /**
   * Convert price from Wei (string) to ETH (number)
   */
  priceWeiToEth(priceWei: string): number {
    return Number(priceWei) / 1e18;
  },

  /**
   * Convert price from ETH (number) to Wei (string)
   */
  priceEthToWei(priceEth: number): string {
    return Math.floor(priceEth * 1e18).toString();
  },

  /**
   * Check if resource is available for purchase
   */
  isAvailable(resource: Resource): boolean {
    return resource.is_active;
  },

  /**
   * Get formatted price display
   */
  getFormattedPrice(resource: Resource): string {
    return `${this.priceWeiToEth(resource.price_wei).toFixed(6)} ETH`;
  },

  /**
   * Create key for Redis caching
   */
  getCacheKey(resourceId: string): string {
    return `resourceMeta:${resourceId}`;
  }
};
