// Etherscan API event fetching using direct contract logs approach
// This is the primary strategy for fetching events efficiently

const ETHERSCAN_BASE_URL = 'https://api-sepolia.etherscan.io/api'
const CONTRACT_ADDRESS = '0x8423064df5BF3AeB77bECcB9e1424bA5dADAa179'

export interface EtherscanEventLog {
  address: string
  topics: string[]
  data: string
  blockNumber: string
  timeStamp: string
  gasPrice: string
  gasUsed: string
  logIndex: string
  transactionHash: string
  transactionIndex: string
}

/**
 * Fetch historical events using Etherscan's direct contract logs API
 * This approach is much more efficient than block-by-block searching
 */
export async function fetchHistoricalEventsEtherscan(
  fromBlock: number | string = 0,
  toBlock: number | string = 'latest'
): Promise<EtherscanEventLog[]> {
  const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY
  
  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_ETHERSCAN_API_KEY is required for Etherscan event fetching')
  }

  // Use direct contract logs API - much more efficient
  const url = `${ETHERSCAN_BASE_URL}?module=logs&action=getLogs&address=${CONTRACT_ADDRESS}&fromBlock=${fromBlock}&toBlock=${toBlock}&apikey=${apiKey}`
  
  console.log(`🔍 Etherscan: Fetching logs for contract ${CONTRACT_ADDRESS}`)
  
  try {
    const response = await fetch(url)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(`Etherscan API error: ${response.status} ${response.statusText}`)
    }
    
    if (data.status === '0') {
      if (data.message === 'No records found') {
        console.log('✅ Etherscan: No events found (this is normal if no transactions have occurred)')
        return []
      }
      throw new Error(`Etherscan API error: ${data.message}`)
    }
    
    if (!data.result || !Array.isArray(data.result)) {
      throw new Error('Etherscan API returned invalid data format')
    }
    
    const logs = data.result as EtherscanEventLog[]
    console.log(`✅ Etherscan: Retrieved ${logs.length} events using direct contract logs API`)
    
    // Sort by block number descending (most recent first)
    return logs.sort((a, b) => parseInt(b.blockNumber, 16) - parseInt(a.blockNumber, 16))
    
  } catch (error) {
    console.error('❌ Etherscan fetch failed:', error)
    throw error
  }
}

/**
 * Get the latest block number from Etherscan
 * Useful for debugging and relative block calculations
 */
export async function getLatestBlockNumberEtherscan(): Promise<number> {
  const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY
  
  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_ETHERSCAN_API_KEY is required')
  }

  const url = `${ETHERSCAN_BASE_URL}?module=proxy&action=eth_blockNumber&apikey=${apiKey}`
  
  try {
    const response = await fetch(url)
    const data = await response.json()
    
    if (!response.ok || data.error) {
      throw new Error(`Etherscan API error: ${data.error?.message || response.statusText}`)
    }
    
    return parseInt(data.result, 16)
    
  } catch (error) {
    console.error('❌ Etherscan latest block fetch failed:', error)
    throw error
  }
}