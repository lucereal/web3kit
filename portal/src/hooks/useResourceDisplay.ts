"use client"
import { useMemo } from "react"
import type { Resource } from "@san-dev/access-contract-decoder"
import { formatWeiToEthSimple } from "@/utils/blockchain"

export function useResourceDisplay(resource: Resource | undefined) {
  const priceDisplay = useMemo(() => {
    // Convert from Wei to ETH using utility function
    if (resource?.price) {
      return `${formatWeiToEthSimple(resource.price, 4)} ETH`
    }
    return "0 ETH"
  }, [resource?.price])

  const sellerDisplay = useMemo(() => {
    const seller = resource?.owner
    if (!seller) return "Unknown"
    return `${seller.slice(0, 6)}...${seller.slice(-4)}`
  }, [resource?.owner])

  const typeDisplay = useMemo(() => {
    if (resource?.resourceType === 0) return 'URL'
    if (resource?.resourceType === 1) return 'IPFS'
    return 'Unknown'
  }, [resource?.resourceType])

  const statusDisplay = useMemo(() => {
    if (!resource?.isActive) return { text: 'Inactive', variant: 'outline' as const }
    return { text: 'Active', variant: 'outline' as const }
  }, [resource?.isActive])

  return {
    priceDisplay,
    sellerDisplay,
    typeDisplay,
    statusDisplay,
    name: resource?.name || 'Unknown',
    description: resource?.description || 'No description available'
  }
}
