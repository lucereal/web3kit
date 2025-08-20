"use client"
import { useMemo } from "react"
import { useResources } from "./useContract"
import type { Resource } from "@/data/resource"

export function useExploreResources() {
  const { data: resources, isLoading, error, refetch } = useResources()

  // Filter and process resources for exploration
  const exploreData = useMemo(() => {
    if (!resources || !Array.isArray(resources)) {
      return {
        activeResources: [],
        inactiveResources: [],
        totalResources: 0
      }
    }

    const resourcesWithId = (resources as Resource[]).map((resource, index) => ({
      ...resource,
      resourceId: BigInt(index)
    }))

    const activeResources = resourcesWithId.filter(resource => resource.isActive)
    const inactiveResources = resourcesWithId.filter(resource => !resource.isActive)

    return {
      activeResources,
      inactiveResources,
      totalResources: resourcesWithId.length
    }
  }, [resources])

  return {
    // Processed data
    ...exploreData,
    allResources: resources as Resource[] || [],
    
    // States
    isLoading,
    error,
    
    // Actions  
    refetch,
    
    // Stats
    stats: {
      total: exploreData.totalResources,
      active: exploreData.activeResources.length,
      inactive: exploreData.inactiveResources.length
    }
  }
}
