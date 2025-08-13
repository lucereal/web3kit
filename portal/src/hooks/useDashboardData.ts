import { useAccount } from 'wagmi'
import { useResources, useSellerBalance } from '@/hooks/useContract'
import type { Resource } from '@/data/resource'
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

  // Get user's created resources (where they are the owner)
  const createdResources = useMemo(() => {
    if (!allResources || !address) {
      console.log('No resources or address for created:', { allResources: !!allResources, address })
      return [] as ResourceWithId[]
    }
    const created = (allResources as Resource[])
      .map((resource, index) => ({ ...resource, resourceId: BigInt(index) }))
      .filter(resource => 
        resource.owner?.toLowerCase() === address.toLowerCase()
      )
    console.log('Created resources:', created)
    return created
  }, [allResources, address])

  // For now, let's simplify purchased resources - just show other people's resources
  const purchasedResources = useMemo(() => {
    if (!allResources || !address) {
      console.log('No resources or address for purchased:', { allResources: !!allResources, address })
      return [] as ResourceWithId[]
    }
    const purchased = (allResources as Resource[])
      .map((resource, index) => ({ ...resource, resourceId: BigInt(index) }))
      .filter(resource => 
        resource.owner?.toLowerCase() !== address.toLowerCase()
      )
    console.log('Purchased resources:', purchased)
    return purchased
  }, [allResources, address])

  return {
    // Resources data
    allResources: (allResources as Resource[]) || [],
    createdResources: createdResources as ResourceWithId[],
    purchasedResources: purchasedResources as ResourceWithId[],
    
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
      totalEarnings: (sellerBalance as bigint) || BigInt(0)
    }
  }
}
