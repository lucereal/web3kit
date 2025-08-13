import { simulateContract, writeContract, waitForTransactionReceipt } from 'wagmi/actions'
import { ACCESS_ADDRESS, ACCESS_ABI, FN, ACCESS_CHAIN } from '@/contracts/access'
import { ResourceType } from '@/data/resource'
import { config } from '@/app/providers'

export interface CreateResourceInput {
  name: string
  description: string
  cid: string
  url: string
  serviceId: string
  price: bigint
  resourceType: ResourceType
}

// Buy access to a resource
export async function buyResource(resourceId: bigint, priceWei: bigint) {
  const { request } = await simulateContract(config, {
    address: ACCESS_ADDRESS,
    abi: ACCESS_ABI,
    functionName: FN.buy,
    args: [resourceId],
    value: priceWei,
    chainId: ACCESS_CHAIN.id,
  })
  
  const hash = await writeContract(config, request)
  const receipt = await waitForTransactionReceipt(config, { 
    hash, 
    chainId: ACCESS_CHAIN.id 
  })
  
  return { hash, receipt }
}

// Create a new resource
export async function createResource(input: CreateResourceInput) {
  const { request } = await simulateContract(config, {
    address: ACCESS_ADDRESS,
    abi: ACCESS_ABI,
    functionName: FN.create,
    args: [
      input.name,
      input.description,
      input.cid,
      input.url,
      input.serviceId,
      input.price,
      input.resourceType
    ],
    chainId: ACCESS_CHAIN.id,
  })
  
  const hash = await writeContract(config, request)
  const receipt = await waitForTransactionReceipt(config, { 
    hash, 
    chainId: ACCESS_CHAIN.id 
  })
  
  // Extract resource ID from the ResourceCreated event logs
  let resourceId: bigint | null = null
  if (receipt.logs && receipt.logs.length > 0) {
    // Look for ResourceCreated event (first parameter is usually the resource ID)
    try {
      // The resource ID is typically the first log entry's first topic (after event signature)
      const log = receipt.logs[0]
      if (log.topics && log.topics.length > 1 && log.topics[1]) {
        resourceId = BigInt(log.topics[1])
      }
    } catch (error) {
      console.warn("Could not extract resource ID from logs:", error)
    }
  }
  
  return { hash, receipt, resourceId }
}

// Withdraw seller earnings
export async function withdrawEarnings() {
  const { request } = await simulateContract(config, {
    address: ACCESS_ADDRESS,
    abi: ACCESS_ABI,
    functionName: FN.withdraw,
    chainId: ACCESS_CHAIN.id,
  })
  
  const hash = await writeContract(config, request)
  const receipt = await waitForTransactionReceipt(config, { 
    hash, 
    chainId: ACCESS_CHAIN.id 
  })
  
  return { hash, receipt }
}

// Helper to format price from ETH string to wei bigint
export function parseEthToWei(ethString: string): bigint {
  // Handle decimal places up to 18 digits
  const parts = ethString.split('.')
  const whole = parts[0] || '0'
  const decimal = (parts[1] || '').padEnd(18, '0').slice(0, 18)
  
  return BigInt(whole + decimal)
}

// Helper to format wei bigint to ETH string
export function formatWeiToEth(wei: bigint): string {
  const weiString = wei.toString()
  const ethString = weiString.padStart(19, '0') // 18 decimals + 1 whole
  const whole = ethString.slice(0, -18) || '0'
  const decimal = ethString.slice(-18).replace(/0+$/, '') || '0'
  
  return decimal === '0' ? whole : `${whole}.${decimal}`
}
