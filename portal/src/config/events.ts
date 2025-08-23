// Configuration for historical event fetching strategies

export const EVENT_FETCHING_CONFIG = {
  // Block range limits (mainly for wagmi fallback since Etherscan uses direct contract logs API)
  maxHistoricalBlocks: parseInt(process.env.NEXT_PUBLIC_HISTORICAL_BLOCKS || '500'),
  maxBlocksPerRequest: parseInt(process.env.NEXT_PUBLIC_BLOCKS_PER_REQUEST || '200'),
  
  // Rate limiting
  maxEventsPerFetch: parseInt(process.env.NEXT_PUBLIC_MAX_EVENTS || '1000'),
  
  // Caching
  cacheEvents: process.env.NEXT_PUBLIC_CACHE_EVENTS !== 'false',
  cacheDuration: parseInt(process.env.NEXT_PUBLIC_CACHE_DURATION || '300000'), // 5 minutes
}

// Environment variable template for .env.local:
/*
# Event Fetching Configuration (Simple: Etherscan → wagmi fallback)
NEXT_PUBLIC_ETHERSCAN_API_KEY=your_etherscan_api_key
NEXT_PUBLIC_HISTORICAL_BLOCKS=500
NEXT_PUBLIC_BLOCKS_PER_REQUEST=200
NEXT_PUBLIC_MAX_EVENTS=1000
NEXT_PUBLIC_CACHE_EVENTS=true
NEXT_PUBLIC_CACHE_DURATION=300000
*/
