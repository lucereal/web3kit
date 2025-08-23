// Unified event fetching service with Etherscan as primary strategy
import { fetchHistoricalEventsEtherscan } from './etherscan-events'
import { getPublicClient } from 'wagmi/actions'
import { config } from '@/app/providers'
import { ACCESS_ADDRESS } from '@/contracts/access'
import { EVENT_FETCHING_CONFIG } from '@/config/events'
import { decodeAccessContractEvent } from '@san-dev/access-contract-decoder'

export interface UnifiedEventLog {
  address: string
  topics: string[]
  data: string
  blockNumber: string
  transactionHash: string
  logIndex: string
}

/**
 * Fetches historical events using the best available strategy
 * Priority: Etherscan > Wagmi Public Client
 */
export async function fetchHistoricalEvents(
  fromBlock: number | string = 0,
  toBlock: number | string = 'latest'
): Promise<UnifiedEventLog[]> {
  // Simple strategy: try Etherscan first, fallback to wagmi
  const hasEtherscanKey = !!process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY
  
  console.log('🚀 Starting event fetch: Etherscan → wagmi fallback')
  
  const strategies = [
    { name: 'etherscan', enabled: hasEtherscanKey },
    { name: 'wagmi', enabled: true } // Always available as fallback
  ]
  
  const enabledStrategies = strategies.filter(s => s.enabled)
  
  let lastError: Error | null = null
  
  for (const { name } of enabledStrategies) {
    try {
      console.log(`🔄 Trying ${name} strategy...`)
      
      switch (name) {
        case 'etherscan':
          // For Etherscan, pass 0 and 'latest' to let it handle the block range calculation
          const etherscanLogs = await fetchHistoricalEventsEtherscan(0, 'latest')
          console.log(`✅ Etherscan: Retrieved ${etherscanLogs.length} logs`)
          return etherscanLogs.map(normalizeEtherscanLog)
          
        case 'wagmi':
          // For wagmi, pass 0 and 'latest' to let it handle the block range calculation
          const wagmiLogs = await fetchWithWagmi(0, 'latest')
          console.log(`✅ Wagmi: Retrieved ${wagmiLogs.length} logs`)
          return wagmiLogs.map(normalizeWagmiLog)
          
        default:
          throw new Error(`Unknown strategy: ${name}`)
      }
    } catch (error) {
      lastError = error as Error
      console.warn(`⚠️ ${name} strategy failed:`, error)
      
      // If this was the last strategy, throw the error
      // Check if this is the last strategy, and if so, show more detailed error
      if (name === enabledStrategies[enabledStrategies.length - 1].name) {
        throw new Error(`All event fetching strategies failed. Last error: ${lastError?.message}`)
      }
      
      // Continue to next strategy
      continue
    }
  }
  
  // This should never be reached, but just in case
  throw new Error('No event fetching strategies available')
}

/**
 * Fetch events using wagmi public client (fallback) with smart batching
 */
async function fetchWithWagmi(fromBlock: number | string, toBlock: number | string) {
  // Handle SSR case where config might be null
  if (!config) {
    throw new Error('Wagmi config not available (SSR context)')
  }
  
  const publicClient = getPublicClient(config)
  
  if (!publicClient) {
    throw new Error('No wagmi public client available')
  }

  // Simple approach: just get recent events without complex batching
  const latestBlock = await publicClient.getBlockNumber()
  const maxBlocks = EVENT_FETCHING_CONFIG.maxHistoricalBlocks || 500
  const fromBlockNum = Math.max(Number(latestBlock) - maxBlocks, 0)
  
  console.log(`📦 Wagmi: fetching from block ${fromBlockNum} to latest (${latestBlock})`)
  
  try {
    const logs = await publicClient.getLogs({
      address: ACCESS_ADDRESS,
      fromBlock: BigInt(fromBlockNum),
      toBlock: 'latest',
    })
    
    console.log(`✅ Wagmi: Retrieved ${logs.length} events`)
    return logs
    
  } catch (error) {
    console.error('❌ Wagmi fetch failed:', error)
    throw error
  }
}

/**
 * Normalize different log formats to a unified structure
 */
function normalizeEtherscanLog(log: any): UnifiedEventLog {
  return {
    address: log.address,
    topics: log.topics,
    data: log.data,
    blockNumber: log.blockNumber,
    transactionHash: log.transactionHash,
    logIndex: log.logIndex,
  }
}

function normalizeWagmiLog(log: any): UnifiedEventLog {
  return {
    address: log.address,
    topics: log.topics,
    data: log.data,
    blockNumber: `0x${log.blockNumber.toString(16)}`,
    transactionHash: log.transactionHash,
    logIndex: `0x${log.logIndex.toString(16)}`,
  }
}

/**
 * Get block range for historical fetching based on configuration
 */
export function getHistoricalBlockRange(): { fromBlock: number; toBlock: string } {
  const historicalBlocks = EVENT_FETCHING_CONFIG.maxHistoricalBlocks
  
  return {
    fromBlock: historicalBlocks,
    toBlock: 'latest'
  }
}
