"use client"
import { useState, useCallback } from "react"
import { useAccount } from "wagmi"
import { useNetworkGuard } from "./useNetworkGuard"
import { useContractWrites } from "./useContractWrites"
import { parseEthToWei } from "@/utils/blockchain"
import { ResourceType } from "@/data/resource"
import type { CreateResourceInput } from "./useContractWrites"

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
  const { isConnected } = useAccount()
  const { wrong: wrongNetwork, onSwitch, isPending: switchPending } = useNetworkGuard()
  const { createResource, isPending, isSuccess, error, hash } = useContractWrites()
  
  const [createdResource, setCreatedResource] = useState<CreatedResourceData | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorDetails, setErrorDetails] = useState<any>(null)

  const handleCreateResource = useCallback(async (formData: CreateResourceFormData) => {
    // Validation
    if (!isConnected) {
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
      
      await createResource({
        name: formData.name,
        description: formData.description,
        cid: formData.cid || "",
        url: formData.url || "",
        serviceId: formData.serviceId || "",
        price: priceWei,
        resourceType: formData.resourceType === "URL" ? ResourceType.URL : ResourceType.IPFS
      })

      // Show success modal immediately after transaction is submitted
      setShowSuccessModal(true)
      
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
  }, [isConnected, wrongNetwork, createResource])

  // Update transaction hash when we get it
  const updateTransactionHash = useCallback(() => {
    if (hash && createdResource) {
      setCreatedResource(prev => prev ? { ...prev, txHash: hash } : null)
    }
  }, [hash, createdResource])

  // Call this in a useEffect in the component
  const getTransactionHashEffect = () => {
    if (isSuccess && hash && createdResource?.txHash === "pending") {
      setCreatedResource(prev => prev ? { ...prev, txHash: hash } : null)
    }
  }

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
        error,
        hash,
        createdResource,
        showSuccessModal,
        showErrorModal,
        errorDetails,
        isConnected,
        wrongNetwork
      })
    }
  }), [isPending, isSuccess, error, hash, createdResource, showSuccessModal, showErrorModal, errorDetails, isConnected, wrongNetwork])

  return {
    // Actions
    createResource: handleCreateResource,
    resetState,
    
    // State
    isPending,
    isSuccess,
    error,
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
    
    // Effect helper
    getTransactionHashEffect,
    
    // Debug helpers (only in development)
    ...(process.env.NODE_ENV === 'development' ? { debug: debugHelpers } : {})
  }
}
