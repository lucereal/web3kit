"use client"

import { useState, useEffect, useCallback } from 'react'
import { watchContractEvent } from 'wagmi/actions'
import { config } from '@/app/providers'
import { ACCESS_ADDRESS, ACCESS_ABI } from '@/contracts/access'
import { decodeAccessContractEvent, type AccessContractEvent } from '@san-dev/access-contract-decoder'

export interface ContractEvent {
  key: string
  eventName: string
  args: AccessContractEvent
  transactionHash: string
  logIndex: number
  blockNumber: number
  address: string
  decodedEvent: AccessContractEvent
}

export function useGlobalEvents() {
  const [events, setEvents] = useState<ContractEvent[]>([])

  useEffect(() => {
    // Handle SSR case where config might be null
    if (!config) {
      console.warn('Wagmi config not available for event watching')
      return
    }
    
    const unwatch = watchContractEvent(config, {
      address: ACCESS_ADDRESS,
      abi: ACCESS_ABI,
      onLogs: (logs) => {
        const processedLogs = logs.map((log) => {
          try {
            // Use your decoder package to properly decode events
            const decodedEvent = decodeAccessContractEvent({
              topics: log.topics,
              data: log.data
            })
            
            return {
              key: `${log.transactionHash}:${log.logIndex}`,
              eventName: decodedEvent.name,
              args: decodedEvent,
              transactionHash: log.transactionHash || '',
              logIndex: log.logIndex || 0,
              blockNumber: Number(log.blockNumber),
              address: log.address,
              decodedEvent
            }
          } catch (error) {
            // Skip logs that don't match our contract events
            console.warn('Failed to decode event:', error)
            return null
          }
        }).filter(Boolean) as ContractEvent[]
        
        setEvents(prevEvents => {
          const existingKeys = new Set(prevEvents.map(e => e.key))
          const newEvents = processedLogs.filter(logItem => !existingKeys.has(logItem.key))
          return [...newEvents, ...prevEvents]
        })
      },
    })

    return unwatch
  }, [])

  const clearEvents = useCallback(() => {
    setEvents([])
  }, [])

  return { events, clearEvents }
}

export function useResourceEvents(resourceId: bigint | undefined) {
  const [events, setEvents] = useState<ContractEvent[]>([])

  useEffect(() => {
    if (resourceId === undefined) return
    
    // Handle SSR case where config might be null
    if (!config) {
      console.warn('Wagmi config not available for event watching')
      return
    }

    const unwatch = watchContractEvent(config, {
      address: ACCESS_ADDRESS,
      abi: ACCESS_ABI,
      onLogs: (logs) => {
        const processedLogs = logs.map((log) => {
          try {
            // Use your decoder package to properly decode events
            const decodedEvent = decodeAccessContractEvent({
              topics: log.topics,
              data: log.data
            })
            
            // Filter events related to this resourceId
            if (
              (decodedEvent.name === 'AccessPurchased' && decodedEvent.resourceId === resourceId) ||
              (decodedEvent.name === 'ResourceCreated' && decodedEvent.resourceId === resourceId) ||
              decodedEvent.name === 'Withdrawal' // Include all withdrawals for now
            ) {
              return {
                key: `${log.transactionHash}:${log.logIndex}`,
                eventName: decodedEvent.name,
                args: decodedEvent,
                transactionHash: log.transactionHash || '',
                logIndex: log.logIndex || 0,
                blockNumber: Number(log.blockNumber),
                address: log.address,
                decodedEvent
              }
            }
            return null
          } catch (error) {
            // Skip logs that don't match our contract events
            console.warn('Failed to decode event:', error)
            return null
          }
        }).filter(Boolean) as ContractEvent[]
        
        setEvents(prevEvents => {
          const existingKeys = new Set(prevEvents.map(e => e.key))
          const newEvents = processedLogs.filter(logItem => !existingKeys.has(logItem.key))
          return [...newEvents, ...prevEvents]
        })
      },
    })

    return unwatch
  }, [resourceId])

  const clearEvents = useCallback(() => {
    setEvents([])
  }, [])

  return { events, clearEvents }
}

export function useSellerEvents(sellerAddress: `0x${string}` | undefined) {
  const [events, setEvents] = useState<ContractEvent[]>([])

  useEffect(() => {
    if (!sellerAddress) return
    
    // Handle SSR case where config might be null
    if (!config) {
      console.warn('Wagmi config not available for event watching')
      return
    }

    const unwatch = watchContractEvent(config, {
      address: ACCESS_ADDRESS,
      abi: ACCESS_ABI,
      onLogs: (logs) => {
        const processedLogs = logs.map((log) => {
          try {
            // Use your decoder package to properly decode events
            const decodedEvent = decodeAccessContractEvent({
              topics: log.topics,
              data: log.data
            })
            
            // Filter withdrawal events for this seller
            if (decodedEvent.name === 'Withdrawal' && decodedEvent.seller === sellerAddress) {
              return {
                key: `${log.transactionHash}:${log.logIndex}`,
                eventName: decodedEvent.name,
                args: decodedEvent,
                transactionHash: log.transactionHash || '',
                logIndex: log.logIndex || 0,
                blockNumber: Number(log.blockNumber),
                address: log.address,
                decodedEvent
              }
            }
            return null
          } catch (error) {
            // Skip logs that don't match our contract events
            console.warn('Failed to decode event:', error)
            return null
          }
        }).filter(Boolean) as ContractEvent[]
        
        setEvents(prevEvents => {
          const existingKeys = new Set(prevEvents.map(e => e.key))
          const newEvents = processedLogs.filter(logItem => !existingKeys.has(logItem.key))
          return [...newEvents, ...prevEvents]
        })
      },
    })

    return unwatch
  }, [sellerAddress])

  const clearEvents = useCallback(() => {
    setEvents([])
  }, [])

  return { events, clearEvents }
}
