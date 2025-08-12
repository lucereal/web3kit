"use client"
import { useState, useCallback } from "react"
import { toast } from "sonner"

export type TxStep = 'prepare'|'sign'|'pending'|'confirmed'|'error'

interface UseTxReturn {
  step: TxStep
  txHash?: string
  block?: number
  errorMessage?: string
  write: () => Promise<void>
  reset: () => void
}

export function useTx(): UseTxReturn {
  const [step, setStep] = useState<TxStep>('prepare')
  const [txHash, setTxHash] = useState<string>()
  const [block, setBlock] = useState<number>()
  const [errorMessage, setErrorMessage] = useState<string>()

  const write = useCallback(async () => {
    try {
      setStep('prepare')
      setErrorMessage(undefined)
      
      // Simulate preparation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStep('sign')
      
      // Simulate user signing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`
      setTxHash(mockTxHash)
      setStep('pending')
      
      // Simulate pending transaction
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // 90% success rate for demo
      if (Math.random() > 0.1) {
        const mockBlock = 18500000 + Math.floor(Math.random() * 1000)
        setBlock(mockBlock)
        setStep('confirmed')
        toast.success("Transaction confirmed!")
      } else {
        setErrorMessage("Transaction reverted: Insufficient funds")
        setStep('error')
        toast.error("Transaction failed")
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error")
      setStep('error')
      toast.error("Transaction failed")
    }
  }, [])

  const reset = useCallback(() => {
    setStep('prepare')
    setTxHash(undefined)
    setBlock(undefined)
    setErrorMessage(undefined)
  }, [])

  return { step, txHash, block, errorMessage, write, reset }
}
