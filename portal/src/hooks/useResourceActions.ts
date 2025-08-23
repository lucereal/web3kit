"use client"
import { useState, useMemo } from "react"
import { useAccount } from "wagmi"
import { useHasAccess } from "./useContract"
import { useNetworkGuard } from "./useNetworkGuard"
import { useContractWrites } from "./useContractWrites"
import type { Resource } from "@san-dev/access-contract-decoder"

export interface ButtonState {
  type: 'connect' | 'switch' | 'owned' | 'buying' | 'buy' | 'your-resource'
  disabled: boolean
  action?: () => void | Promise<void>
  loading?: boolean
}

export function useResourceActions(resourceId: bigint, resource: Resource | undefined) {
  const { address, isConnected } = useAccount()
  const { data: hasAccess } = useHasAccess(resourceId)
  const { wrong: wrongNetwork, onSwitch, isPending: switchPending } = useNetworkGuard()
  const { buyResource, isPending: buyPending } = useContractWrites()
  
  const handleBuy = async () => {
    try {
      if (!resource) throw new Error('Resource not found')
      await buyResource(resourceId, resource.price)
    } catch (error) {
      console.error('Buy failed:', error)
      // Error handling is done in the component via toast
    }
  }

  const buttonState: ButtonState = useMemo(() => {
    if (!isConnected) {
      return { type: 'connect', disabled: true }
    }
    
    if (wrongNetwork) {
      return { 
        type: 'switch', 
        disabled: switchPending,
        loading: switchPending,
        action: onSwitch 
      }
    }
    
    if (hasAccess) {
      return { type: 'owned', disabled: true }
    }
    
    if (resource?.owner?.toLowerCase() === address?.toLowerCase()) {
      return { type: 'your-resource', disabled: true }
    }
    
    if (buyPending) {
      return { type: 'buying', disabled: true, loading: true }
    }
    
    return { 
      type: 'buy', 
      disabled: !resource?.isActive,
      action: handleBuy 
    }
  }, [isConnected, wrongNetwork, hasAccess, buyPending, resource, address, switchPending, onSwitch])

  return {
    buttonState,
    handleAction: buttonState.action,
    isPending: buyPending
  }
}
