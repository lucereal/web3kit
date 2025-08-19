import { simulateContract, writeContract, waitForTransactionReceipt } from 'wagmi/actions'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ACCESS_ADDRESS, ACCESS_ABI, FN, ACCESS_CHAIN } from '../contracts/access'
import { ResourceType } from '../data/resource'
import { config } from '../app/providers'
import { useState } from 'react'
import { parseEther } from 'viem'

export interface CreateResourceInput {
  name: string
  description: string
  cid: string
  url: string
  serviceId: string
  price: bigint
  resourceType: ResourceType
}

// Standalone functions (your current approach - keep these for flexibility)
export async function buyResource(resourceId: bigint, priceWei: bigint) {
  const { request } = await simulateContract(config, {
    address: ACCESS_ADDRESS,
    abi: ACCESS_ABI,
    functionName: FN.buy,
    args: [resourceId],
    value: priceWei,
    chainId: ACCESS_CHAIN.id,
  })
  
  const hash = await writeContract(config, request)
  const receipt = await waitForTransactionReceipt(config, { 
    hash, 
    chainId: ACCESS_CHAIN.id 
  })
  
  return { hash, receipt }
}

export async function createResource(input: CreateResourceInput) {
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
  
  const hash = await writeContract(config, request)
  const receipt = await waitForTransactionReceipt(config, { 
    hash, 
    chainId: ACCESS_CHAIN.id 
  })
  
  return { hash, receipt }
}

export async function withdrawEarnings() {
  const { request } = await simulateContract(config, {
    address: ACCESS_ADDRESS,
    abi: ACCESS_ABI,
    functionName: FN.withdraw,
    chainId: ACCESS_CHAIN.id,
  })
  
  const hash = await writeContract(config, request)
  const receipt = await waitForTransactionReceipt(config, { 
    hash, 
    chainId: ACCESS_CHAIN.id 
  })
  
  return { hash, receipt }
}

// React hooks for better UX (NEW - adds to your existing approach)
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

  const buyResourceWithHook = async (resourceId: bigint, priceWei: bigint) => {
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

  const createResourceWithHook = async (input: CreateResourceInput) => {
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

  const withdrawEarningsWithHook = async () => {
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
    buyResource: buyResourceWithHook,
    createResource: createResourceWithHook,
    withdrawEarnings: withdrawEarningsWithHook,
    
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

// Helper functions (keep your existing ones)
export function parseEthToWei(ethString: string): bigint {
  const parts = ethString.split('.')
  const whole = parts[0] || '0'
  const decimal = (parts[1] || '').padEnd(18, '0').slice(0, 18)
  
  return BigInt(whole + decimal)
}

export function formatWeiToEth(wei: bigint): string {
  const ethString = wei.toString()
  const decimals = 18
  
  if (ethString.length <= decimals) {
    return `0.${ethString.padStart(decimals, '0')}`
  }
  
  const whole = ethString.slice(0, -decimals)
  const decimal = ethString.slice(-decimals)
  
  return `${whole}.${decimal.replace(/0+$/, '')}`
}
