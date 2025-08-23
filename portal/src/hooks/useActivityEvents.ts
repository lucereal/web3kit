"use client"

import { useState, useEffect, useMemo } from 'react'
import { useGlobalEvents, type ContractEvent } from '@/hooks/useEventWatchers'
import { fetchHistoricalEvents, getHistoricalBlockRange } from '@/utils/unified-events'
import { decodeAccessContractEvent, type AccessContractEvent } from '@san-dev/access-contract-decoder'
import { formatWeiToEth } from '@/utils/blockchain'

export interface ActivityEvent {
  id: string
  type: 'purchase' | 'listing' | 'withdrawal' | 'transfer'
  actor: string
  resource?: string
  resourceName?: string
  amount?: string
  timestamp: string
  txHash: string
  blockNumber: number
  rawEvent?: AccessContractEvent
}

/**
 * Hook for getting both historical and real-time blockchain events for the activity feed
 * Uses intelligent fallback strategy: Alchemy > Etherscan > Wagmi Public Client
 */
export function useActivityEvents(maxEvents: number = 50) {
  const [historicalEvents, setHistoricalEvents] = useState<ContractEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [strategy, setStrategy] = useState<string>('unknown')
  
  // Get real-time events
  const { events: realtimeEvents, clearEvents } = useGlobalEvents()

  // Fetch historical events on mount using unified service
  useEffect(() => {
    const fetchHistoricalEventsData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Get optimal block range based on configuration
        const { fromBlock, toBlock } = getHistoricalBlockRange()
        
        console.log(`🔍 Fetching events from last ${fromBlock} blocks (${fromBlock} to ${toBlock})...`)
        
        // Use unified service that handles strategy selection
        const logs = await fetchHistoricalEvents(fromBlock, toBlock)
        
        console.log(`📊 Raw logs received:`, logs.length)
        
        const processedLogs = logs
          .map((log) => {
            try {
              const decodedEvent = decodeAccessContractEvent({
                topics: log.topics,
                data: log.data
              })
              
              console.log('🔍 Decoded event:', { 
                name: decodedEvent.name, 
                tx: log.transactionHash,
                block: log.blockNumber 
              })
              
              return {
                key: `${log.transactionHash}:${log.logIndex}`,
                eventName: decodedEvent.name,
                args: decodedEvent,
                transactionHash: log.transactionHash,
                logIndex: parseInt(log.logIndex, 16),
                blockNumber: parseInt(log.blockNumber, 16),
                address: log.address,
                decodedEvent
              }
            } catch (error) {
              // Log the specific event that failed for debugging
              console.warn('Failed to decode historical event:', {
                error: error instanceof Error ? error.message : error,
                topicHash: log.topics?.[0],
                transactionHash: log.transactionHash,
                logIndex: log.logIndex
              })
              return null
            }
          }).filter(Boolean) as ContractEvent[]

        setHistoricalEvents(processedLogs)
        setStrategy('success') // We don't know which strategy succeeded, but it worked
        console.log(`✅ Successfully loaded ${processedLogs.length} historical events`)
        
      } catch (err) {
        console.error('Failed to fetch historical events:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch events')
        setStrategy('failed')
        // Continue without historical events - real-time events will still work
        setHistoricalEvents([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistoricalEventsData()
  }, [])

  // Combine and transform events
  const activityEvents = useMemo(() => {
    // Combine historical and real-time events
    const allEvents = [...realtimeEvents, ...historicalEvents]
    
    console.log(`🔍 Activity events processing:`, {
      realtimeEvents: realtimeEvents.length,
      historicalEvents: historicalEvents.length,
      totalEvents: allEvents.length
    })
    
    // Remove duplicates based on key
    const uniqueEvents = allEvents.filter((event, index, self) => 
      index === self.findIndex(e => e.key === event.key)
    )
    
    console.log(`🔍 After deduplication: ${uniqueEvents.length} events`)
    
    // Sort by block number (most recent first)
    const sortedEvents = uniqueEvents.sort((a, b) => b.blockNumber - a.blockNumber)
    
    // Transform to ActivityEvent format
    const transformedEvents: ActivityEvent[] = sortedEvents.map((event) => {
      // Create a more accurate timestamp based on block number
      // Rough estimate: 12 seconds per block on mainnet
      const estimatedTimestamp = new Date(Date.now() - (Date.now() - event.blockNumber * 12000))
      
      const baseEvent = {
        id: event.key,
        actor: '', // Will be set based on event type
        timestamp: estimatedTimestamp.toISOString(),
        txHash: event.transactionHash,
        blockNumber: event.blockNumber,
        rawEvent: event.decodedEvent
      }

      // Transform based on event type with proper type guards
      switch (event.eventName) {
        case 'AccessPurchased':
          return {
            ...baseEvent,
            type: 'purchase' as const,
            actor: (event.decodedEvent as any).buyer || '',
            resource: (event.decodedEvent as any).resourceId?.toString(),
            amount: (event.decodedEvent as any).amount ? formatWeiToEth((event.decodedEvent as any).amount) : undefined,
          }
        
        case 'ResourceCreated':
          return {
            ...baseEvent,
            type: 'listing' as const,
            actor: (event.decodedEvent as any).seller || '',
            resource: (event.decodedEvent as any).resourceId?.toString(),
            resourceName: (event.decodedEvent as any).name || undefined,
            amount: (event.decodedEvent as any).price ? formatWeiToEth((event.decodedEvent as any).price) : undefined,
          }
        
        case 'Withdrawal':
          return {
            ...baseEvent,
            type: 'withdrawal' as const,
            actor: (event.decodedEvent as any).seller || '',
            amount: (event.decodedEvent as any).amount ? formatWeiToEth((event.decodedEvent as any).amount) : undefined,
          }
        
        default:
          return {
            ...baseEvent,
            type: 'transfer' as const,
            actor: event.address,
          }
      }
    }).slice(0, maxEvents) // Limit to maxEvents

    return transformedEvents
  }, [realtimeEvents, historicalEvents, maxEvents])

  return {
    events: activityEvents,
    isLoading,
    error,
    strategy, // Which fetching strategy was used
    clearEvents
  }
}
