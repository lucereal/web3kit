"use client"
import { useState, useMemo } from "react"
import { useAccount } from "wagmi"
import { useHasAccess } from "./useContract"
import { useNetworkGuard } from "./useNetworkGuard"
import type { Resource } from "@/data/resource"

export interface ButtonState {
  type: 'connect' | 'switch' | 'owned' | 'buying' | 'buy' | 'your-resource'
  disabled: boolean
  action?: () => void | Promise<void>
  loading?: boolean
}

export function useResourceActions(resourceId: bigint, resource: Resource) {
  const { address, isConnected } = useAccount()
  const { data: hasAccess } = useHasAccess(resourceId)
  const { wrong: wrongNetwork, onSwitch, isPending: switchPending } = useNetworkGuard()
  const [buying, setBuying] = useState(false)

  const handleBuy = async () => {
    setBuying(true)
    try {
      // Your existing buy logic here
      console.log('Buying resource...', resourceId)
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error('Buy failed:', error)
    } finally {
      setBuying(false)
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
    
    if (resource.owner?.toLowerCase() === address?.toLowerCase()) {
      return { type: 'your-resource', disabled: true }
    }
    
    if (buying) {
      return { type: 'buying', disabled: true, loading: true }
    }
    
    return { 
      type: 'buy', 
      disabled: !resource.isActive,
      action: handleBuy 
    }
  }, [isConnected, wrongNetwork, hasAccess, buying, resource, address, switchPending, onSwitch])

  return {
    buttonState,
    handleAction: buttonState.action,
    buying,
    setBuying
  }
}
