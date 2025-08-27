"use client"
import { useState, useCallback, useEffect } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { decodeEventLog } from "viem"
import { useNetworkGuard } from "./useNetworkGuard"
import { ACCESS_ADDRESS, ACCESS_ABI, FN, ResourceType } from "@/contracts/access"
import { parseEthToWei } from "@/utils/blockchain"

export interface CreateResourceFormData {
  name: string
  description: string
  price: string
  category: string
  url: string
  cid: string
  serviceId: string
  resourceType: "URL" | "IPFS"
}

export interface CreatedResourceData extends CreateResourceFormData {
  txHash: string
  resourceId?: string
}

export function useCreateResource() {
  const { address, isConnected } = useAccount()
  const { wrong: wrongNetwork, onSwitch, isPending: switchPending } = useNetworkGuard()
  
  // Contract write hook
  const { 
    writeContract, 
    data: hash, 
    isPending: isWritePending, 
    isSuccess: writeSuccess, 
    error: writeError 
  } = useWriteContract()
  
  // Wait for transaction confirmation
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed, 
    error: confirmError,
    data: receipt 
  } = useWaitForTransactionReceipt({
    hash,
  })
  
  const [createdResource, setCreatedResource] = useState<CreatedResourceData | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorDetails, setErrorDetails] = useState<any>(null)

  // Combined loading state - pending write OR confirming transaction
  const isPending = isWritePending || isConfirming
  
  // Only show success when transaction is CONFIRMED, not just written
  const isSuccess = isConfirmed

  const handleCreateResource = useCallback(async (formData: CreateResourceFormData) => {
    // Validation
    if (!isConnected || !address) {
      throw new Error("Please connect your wallet")
    }

    if (wrongNetwork) {
      throw new Error("Please switch to Sepolia network")
    }

    if (!formData.name || !formData.description || !formData.price) {
      throw new Error("Please fill in all required fields")
    }

    try {
      const priceWei = parseEthToWei(formData.price)
      
      // Create the resource data that will be used for the modal
      const resourceData: CreatedResourceData = {
        ...formData,
        txHash: "pending"
      }
      
      setCreatedResource(resourceData)
      
      // Use writeContract instead of createResource
      const result = writeContract({
        address: ACCESS_ADDRESS,
        abi: ACCESS_ABI,
        functionName: FN.create,
        args: [
          formData.name,
          formData.description,
          formData.resourceType === "IPFS" ? formData.cid : "",
          formData.resourceType === "URL" ? formData.url : "",
          formData.serviceId || "",
          priceWei,
          formData.resourceType === "URL" ? ResourceType.URL : ResourceType.IPFS
        ],
      })

      return result
      
    } catch (error: any) {
      console.error("Create resource error:", error)
      
      // Set error details for modal
      setErrorDetails({
        message: error.message || "Unknown error occurred",
        reason: error.reason || null,
        code: error.code || null,
        txHash: error.receipt?.transactionHash || null
      })
      
      setShowErrorModal(true)
      throw error // Re-throw so component can handle toasts
    }
  }, [isConnected, address, wrongNetwork, writeContract])

  // Handle successful transaction confirmation
  useEffect(() => {
    if (isConfirmed && receipt && !showSuccessModal) {
      // Extract resource ID from transaction logs
      let resourceId: string | undefined
      
      try {
        // Look for ResourceCreated event in the logs
        for (const log of receipt.logs) {
          if (log.address.toLowerCase() === ACCESS_ADDRESS.toLowerCase()) {
            try {
              const decodedLog = decodeEventLog({
                abi: ACCESS_ABI,
                data: log.data,
                topics: log.topics,
              })
              
              // Check if this is the ResourceCreated event
              if (decodedLog.eventName === 'ResourceCreated') {
                resourceId = (decodedLog.args as any).resourceId?.toString()
                break
              }
            } catch (decodeError) {
              // Skip logs that can't be decoded with our ABI
              continue
            }
          }
        }
      } catch (error) {
        console.warn('Could not extract resource ID from transaction receipt:', error)
      }
      
      // Update created resource with final transaction hash and resource ID
      if (createdResource && hash) {
        setCreatedResource(prev => prev ? {
          ...prev,
          txHash: hash,
          resourceId: resourceId
        } : null)
      }
      
      console.log('Resource created with ID:', resourceId, 'Hash:', hash)
      setShowSuccessModal(true)
    }
  }, [isConfirmed, receipt, showSuccessModal, createdResource, hash])

  // Handle errors (write or confirmation)
  useEffect(() => {
    const error = writeError || confirmError
    if (error && !showErrorModal) {
      setErrorDetails({
        message: error.message || 'Transaction failed',
        code: (error as any).code,
        cause: (error as any).cause
      })
      setShowErrorModal(true)
    }
  }, [writeError, confirmError, showErrorModal])

  const resetState = useCallback(() => {
    setCreatedResource(null)
    setShowSuccessModal(false)
    setShowErrorModal(false)
    setErrorDetails(null)
  }, [])

  // Debug helpers for testing
  const debugHelpers = useCallback(() => ({
    testSuccessModal: () => {
      setCreatedResource({
        name: "Debug Test Resource",
        description: "This is a test resource for debugging the success modal",
        price: "0.001",
        resourceType: "URL" as const,
        category: "API",
        url: "https://api.debug.com/test",
        cid: "",
        serviceId: "debug-test-001",
        txHash: "0xabcdef1234567890abcdef1234567890abcdef12",
        resourceId: "debug-123"
      })
      setShowSuccessModal(true)
    },
    testErrorModal: (errorType: 'rejection' | 'insufficient_funds' | 'execution_reverted' | 'network' = 'rejection') => {
      const errors = {
        rejection: {
          message: "User rejected the request",
          reason: "User cancelled transaction in wallet",
          code: 4001,
          txHash: null
        },
        insufficient_funds: {
          message: "insufficient funds for intrinsic transaction cost",
          reason: "Not enough ETH in wallet",
          code: null,
          txHash: null
        },
        execution_reverted: {
          message: "execution reverted",
          reason: "Smart contract rejected the transaction",
          code: null,
          txHash: "0x1234567890abcdef1234567890abcdef12345678"
        },
        network: {
          message: "Network connection failed",
          reason: "Unable to connect to blockchain network",
          code: -32603,
          txHash: null
        }
      }
      setErrorDetails(errors[errorType])
      setShowErrorModal(true)
    },
    logCurrentState: () => {
      console.log("useCreateResource current state:", {
        isPending,
        isSuccess,
        writeError,
        confirmError,
        hash,
        createdResource,
        showSuccessModal,
        showErrorModal,
        errorDetails,
        isConnected,
        wrongNetwork
      })
    }
  }), [isPending, isSuccess, writeError, confirmError, hash, createdResource, showSuccessModal, showErrorModal, errorDetails, isConnected, wrongNetwork])

  return {
    // Actions
    createResource: handleCreateResource,
    resetState,
    
    // State
    isPending,
    isSuccess,
    isConfirming,
    error: writeError || confirmError,
    hash,
    createdResource,
    showSuccessModal,
    showErrorModal,
    errorDetails,
    
    // Modal handlers
    setShowSuccessModal,
    setShowErrorModal,
    
    // Network state
    isConnected,
    wrongNetwork,
    onSwitch,
    switchPending,
    
    // Effect helper (legacy compatibility)
    getTransactionHashEffect: () => {}, // No longer needed
    
    // Debug helpers (only in development)
    ...(process.env.NODE_ENV === 'development' ? { debug: debugHelpers } : {})
  }
}
