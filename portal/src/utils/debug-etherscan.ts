// Debug utility to test Etherscan connection and API key

interface EtherscanLogResult {
  address: string
  topics: string[]
  data: string
  blockNumber: string
  transactionHash: string
  logIndex: string
  removed: string
}

export const testEtherscanConnection = async () => {
  const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY
  const contractAddress = '0x8423064df5BF3AeB77bECcB9e1424bA5dADAa179'
  
  if (!apiKey) {
    console.error('❌ NEXT_PUBLIC_ETHERSCAN_API_KEY not found')
    return false
  }

  console.log('🔍 Testing Etherscan API key:', apiKey.slice(0, 10) + '***')
  console.log('📍 Testing with contract:', contractAddress)

  // Check API key format
  if (apiKey.length < 20 || !/^[A-Za-z0-9]+$/.test(apiKey)) {
    console.warn('⚠️ API key format looks suspicious - should be 34+ alphanumeric characters')
  }

  try {
    // Test the same direct contract logs API that the actual function uses
    const baseUrl = 'https://api-sepolia.etherscan.io/api'
    const url = `${baseUrl}?module=logs&action=getLogs&address=${contractAddress}&fromBlock=0&toBlock=latest&apikey=${apiKey}`

    console.log('🚀 Testing direct contract logs API (same as production)...')
    console.log('🔍 API URL:', url.replace(apiKey, 'API_KEY_HIDDEN'))

    const response = await fetch(url)

    if (!response.ok) {
      console.error('❌ HTTP Error:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Error body:', errorText)
      return false
    }

    const data = await response.json()
    console.log('� API Response:', data)
    
    if (data.status === '0') {
      if (data.message === 'No records found') {
        console.log('✅ API connection successful! No events found (this is normal if no transactions have occurred)')
        return true
      }
      console.error('❌ Etherscan API Error:', data.message)
      return false
    }
    
    if (data.status === '1') {
      const logs = data.result || []
      console.log(`✅ API connection successful! Found ${logs.length} events using direct contract logs API`)
      
      if (logs.length > 0) {
        // Show block distribution
        const blockNumbers = logs.map((log: any) => parseInt(log.blockNumber, 16))
        const minBlock = Math.min(...blockNumbers)
        const maxBlock = Math.max(...blockNumbers)
        console.log(`📊 Events span from block ${minBlock} to block ${maxBlock}`)
        
        // Show sample events
        console.log('📋 Sample events:')
        logs.slice(0, 3).forEach((log: any, i: number) => {
          console.log(`   Event ${i + 1}: Block ${parseInt(log.blockNumber, 16)}, TX: ${log.transactionHash}`)
        })
        
        if (logs.length > 3) {
          console.log(`   ... and ${logs.length - 3} more events`)
        }
      }
      
      return true
    }
    
    // Handle unexpected response format
    console.error('❌ Unexpected API response format:', data)
    return false
    
  } catch (error) {
    console.error('❌ Network error:', error)
    return false
  }
}


