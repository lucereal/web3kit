import { useAccount } from 'wagmi'
import { useResources, useSellerBalance } from '@/hooks/useContract'
import { useCheckAllForAccess } from '@/hooks/useCheckAccess'
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
    if (!allResources) return [] as ResourceWithId[]
    return (allResources as Resource[]).map((resource, index) => ({
      ...resource,
      resourceId: BigInt(index)
    }))
  }, [allResources])

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

   const { accessResults, allLoaded, getAccess } = useCheckAllForAccess(
    resourcesWithIds.map(r => r.resourceId)
  )

  // For now, let's simplify purchased resources - just show other people's resources
  const purchasedResources = useMemo(() => {
    if (!address || !allLoaded) return [] as ResourceWithId[]
    
    return resourcesWithIds.filter(resource => {
      const isNotMine = resource.owner?.toLowerCase() !== address.toLowerCase()
      const accessCheck = getAccess(resource.resourceId)
      const hasAccess = accessCheck?.data === true
      
      return isNotMine && hasAccess
    })
  }, [resourcesWithIds, address, allLoaded, getAccess])

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
      totalEarnings: (sellerBalance as bigint) || BigInt(0),
      totalEarningsFormatted: formatWeiToEth((sellerBalance as bigint) || BigInt(0))
    }
  }
}
