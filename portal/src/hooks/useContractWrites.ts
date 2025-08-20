import { simulateContract, writeContract, waitForTransactionReceipt } from 'wagmi/actions'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ACCESS_ADDRESS, ACCESS_ABI, FN, ACCESS_CHAIN } from '@/contracts/access'
import { ResourceType } from '@/data/resource'
import { config } from '@/app/providers'
import { useState } from 'react'

export interface CreateResourceInput {
  name: string
  description: string
  cid: string
  url: string
  serviceId: string
  price: bigint
  resourceType: ResourceType
}

/**
 * Hook for blockchain write operations with improved UX
 * Handles wallet connection, loading states, and error management
 */
export function useContractWrites() {
  const { address, isConnected } = useAccount()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })
  const [error, setError] = useState<string | null>(null)

  const ensureWalletConnected = () => {
    if (!isConnected || !address) {
      throw new Error('Please connect your wallet first')
    }
  }

  const buyResource = async (resourceId: bigint, priceWei: bigint) => {
    ensureWalletConnected()
    setError(null)
    
    try {
      // Simulate first to catch errors early
      const { request } = await simulateContract(config, {
        address: ACCESS_ADDRESS,
        abi: ACCESS_ABI,
        functionName: FN.buy,
        args: [resourceId],
        value: priceWei,
        chainId: ACCESS_CHAIN.id,
      })
      
      // Execute the transaction
      writeContract(request)
    } catch (err: any) {
      const message = err.message?.includes('User rejected') 
        ? 'Transaction was cancelled by user'
        : err.shortMessage || err.message || 'Transaction failed'
      setError(message)
      throw err
    }
  }

  const createResource = async (input: CreateResourceInput) => {
    ensureWalletConnected()
    setError(null)
    
    try {
      const { request } = await simulateContract(config, {
        address: ACCESS_ADDRESS,
        abi: ACCESS_ABI,
        functionName: FN.create,
        args: [
          input.name,
          input.description,
          input.cid,
          input.url,
          input.serviceId,
          input.price,
          input.resourceType
        ],
        chainId: ACCESS_CHAIN.id,
      })
      
      writeContract(request)
    } catch (err: any) {
      const message = err.message?.includes('User rejected') 
        ? 'Transaction was cancelled by user'
        : err.shortMessage || err.message || 'Transaction failed'
      setError(message)
      throw err
    }
  }

  const withdrawEarnings = async () => {
    ensureWalletConnected()
    setError(null)
    
    try {
      const { request } = await simulateContract(config, {
        address: ACCESS_ADDRESS,
        abi: ACCESS_ABI,
        functionName: FN.withdraw,
        chainId: ACCESS_CHAIN.id,
      })
      
      writeContract(request)
    } catch (err: any) {
      const message = err.message?.includes('User rejected') 
        ? 'Transaction was cancelled by user'
        : err.shortMessage || err.message || 'Transaction failed'
      setError(message)
      throw err
    }
  }

  return {
    // Actions
    buyResource,
    createResource,
    withdrawEarnings,
    
    // State
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
    
    // Utils
    isWalletConnected: isConnected,
    walletAddress: address,
  }
}

// Helper to format price from ETH string to wei bigint
export function parseEthToWei(ethString: string): bigint {
  // Handle decimal places up to 18 digits
  const parts = ethString.split('.')
  const whole = parts[0] || '0'
  const decimal = (parts[1] || '').padEnd(18, '0').slice(0, 18)
  
  return BigInt(whole + decimal)
}

// Helper to format wei bigint to ETH string
export function formatWeiToEth(wei: bigint): string {
  const weiString = wei.toString()
  const ethString = weiString.padStart(19, '0') // 18 decimals + 1 whole
  const whole = ethString.slice(0, -18) || '0'
  const decimal = ethString.slice(-18).replace(/0+$/, '') || '0'
  
  return decimal === '0' ? whole : `${whole}.${decimal}`
}
