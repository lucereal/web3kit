import { useReadContract, useAccount } from 'wagmi'
import { ACCESS_ADDRESS, ACCESS_ABI, FN } from '@/contracts/access'
import type { Resource } from '@/data/resource'

// Hook to get all resources
export function useResources() {
  return useReadContract({
    address: ACCESS_ADDRESS,
    abi: ACCESS_ABI,
    functionName: FN.getAll,
    query: {
      staleTime: 60_000, // 1 minute
    }
  })
}

// Hook to get a specific resource
export function useResource(id: bigint | undefined) {
  return useReadContract({
    address: ACCESS_ADDRESS,
    abi: ACCESS_ABI,
    functionName: FN.getOne,
    args: id !== undefined ? [id] : undefined,
    query: {
      enabled: id !== undefined,
      staleTime: 60_000,
    }
  })
}

// Hook to check if user has access to a resource
export function useHasAccess(resourceId: bigint | undefined) {
  const { address } = useAccount()
  
  return useReadContract({
    address: ACCESS_ADDRESS,
    abi: ACCESS_ABI,
    functionName: FN.hasAccess,
    args: address && resourceId !== undefined ? [address, resourceId] : undefined,
    query: {
      enabled: !!address && resourceId !== undefined,
      staleTime: 30_000, // 30 seconds
    }
  })
}

// Hook to get seller balance
export function useSellerBalance(address?: `0x${string}`) {
  return useReadContract({
    address: ACCESS_ADDRESS,
    abi: ACCESS_ABI,
    functionName: FN.sellerBal,
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 30_000,
    }
  })
}

// Hook to get next resource ID (useful for forms)
export function useNextResourceId() {
  return useReadContract({
    address: ACCESS_ADDRESS,
    abi: ACCESS_ABI,
    functionName: 'nextResourceId',
    query: {
      staleTime: 30_000,
    }
  })
}
