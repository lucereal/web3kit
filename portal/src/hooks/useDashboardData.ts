import { useAccount } from 'wagmi'
import { useResources, useSellerBalance } from '@/hooks/useContract'
import type { Resource } from '@san-dev/access-contract-decoder'
import { formatWeiToEth } from '@/utils/blockchain'
import { useMemo } from 'react'

type ResourceWithId = Resource & { resourceId: bigint }

export function useDashboardData() {
  const { address } = useAccount()
  const { data: allResources, isLoading: resourcesLoading, error: resourcesError } = useResources()
  const { data: sellerBalance, isLoading: balanceLoading } = useSellerBalance(address)

  // Debug logging
  console.log('Dashboard Data:', {
    address,
    allResources,
    resourcesLoading,
    resourcesError
  })

  const resourcesWithIds = useMemo(() => {
    if (!allResources || !Array.isArray(allResources)) {
      return [] as ResourceWithId[]
    }
    return (allResources as Resource[]).map((resource, index) => ({
      ...resource,
      resourceId: BigInt(index)
    }))
  }, [allResources])

  // Get user's created resources (where they are the owner)
  const createdResources = useMemo(() => {
    if (!address) {
      return [] as ResourceWithId[]
    }
    const created = resourcesWithIds.filter(resource => 
      resource.owner?.toLowerCase() === address.toLowerCase()
    )
    console.log('Created resources:', created)
    return created
  }, [resourcesWithIds, address])

  // For purchased resources, let's simplify for now to avoid the hook order issue
  // We'll filter resources that are NOT created by the user
  // TODO: Add access checking in a future update
  const purchasedResources = useMemo(() => {
    if (!address) return [] as ResourceWithId[]
    
    // For now, just return empty array to avoid showing unowned resources
    // In a real app, you'd check if the user has purchased access
    return [] as ResourceWithId[]
  }, [address])

  return {
    // Resources data
    allResources: resourcesWithIds,
    createdResources,
    purchasedResources,
    
    // Loading states
    isLoading: resourcesLoading || balanceLoading,
    resourcesLoading,
    balanceLoading,
    
    // Error states
    error: resourcesError,
    
    // User data
    address,
    sellerBalance,
    
    // Stats
    stats: {
      totalCreated: createdResources.length,
      totalPurchased: purchasedResources.length,
      totalEarnings: (sellerBalance as bigint) || BigInt(0),
      totalEarningsFormatted: formatWeiToEth((sellerBalance as bigint) || BigInt(0))
    }
  }
}
