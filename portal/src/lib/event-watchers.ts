import { watchContractEvent } from 'wagmi/actions'
import { ACCESS_ADDRESS, ACCESS_ABI } from '@/contracts/access'
import { config } from '@/app/providers'

export interface ContractEvent {
  transactionHash: string
  logIndex: number
  blockNumber: number
  eventName: string
  args: any
  k: string // unique key for deduplication
}

// Extended log interface for typed access
interface ExtendedLog {
  transactionHash: string | null
  logIndex: number | null
  blockNumber: bigint | null
  eventName?: string
  args?: any
}

// Watch all contract events globally
export function watchGlobalEvents(onEvent: (event: ContractEvent) => void) {
  return watchContractEvent(config, {
    address: ACCESS_ADDRESS,
    abi: ACCESS_ABI,
    onLogs: (logs) => {
      logs.forEach((log) => {
        const extLog = log as ExtendedLog
        if (extLog.transactionHash && extLog.logIndex !== null && extLog.blockNumber) {
          const event: ContractEvent = {
            transactionHash: extLog.transactionHash,
            logIndex: extLog.logIndex,
            blockNumber: Number(extLog.blockNumber),
            eventName: extLog.eventName || 'Unknown',
            args: extLog.args,
            k: `${extLog.transactionHash}:${extLog.logIndex}`
          }
          onEvent(event)
        }
      })
    },
  })
}

// Watch events for a specific resource
export function watchResourceEvents(
  resourceId: bigint, 
  onEvent: (event: ContractEvent) => void
) {
  return watchContractEvent(config, {
    address: ACCESS_ADDRESS,
    abi: ACCESS_ABI,
    onLogs: (logs) => {
      logs.forEach((log) => {
        const extLog = log as ExtendedLog
        if (extLog.transactionHash && extLog.logIndex !== null && extLog.blockNumber) {
          const k = `${extLog.transactionHash}:${extLog.logIndex}`
          
          // Filter events related to the specific resource
          let isRelevant = false
          
          if (extLog.eventName === 'ResourceCreated' && extLog.args?.resourceId === resourceId) {
            isRelevant = true
          } else if (extLog.eventName === 'AccessPurchased' && extLog.args?.resourceId === resourceId) {
            isRelevant = true
          }
          
          if (isRelevant) {
            const event: ContractEvent = {
              transactionHash: extLog.transactionHash,
              logIndex: extLog.logIndex,
              blockNumber: Number(extLog.blockNumber),
              eventName: extLog.eventName || 'Unknown',
              args: extLog.args,
              k
            }
            onEvent(event)
          }
        }
      })
    },
  })
}

// Watch withdrawal events for a specific seller
export function watchSellerEvents(
  sellerAddress: `0x${string}`, 
  onEvent: (event: ContractEvent) => void
) {
  return watchContractEvent(config, {
    address: ACCESS_ADDRESS,
    abi: ACCESS_ABI,
    args: {
      seller: sellerAddress
    },
    onLogs: (logs) => {
      logs.forEach((log) => {
        const extLog = log as ExtendedLog
        if (extLog.transactionHash && extLog.logIndex !== null && extLog.blockNumber) {
          const event: ContractEvent = {
            transactionHash: extLog.transactionHash,
            logIndex: extLog.logIndex,
            blockNumber: Number(extLog.blockNumber),
            eventName: extLog.eventName || 'Unknown',
            args: extLog.args,
            k: `${extLog.transactionHash}:${extLog.logIndex}`
          }
          onEvent(event)
        }
      })
    },
  })
}
