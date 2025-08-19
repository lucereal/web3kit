import { useAccount, useSignMessage } from 'wagmi'
import { useState } from 'react'

export function useWalletAuth() {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const authenticate = async (): Promise<string> => {
    if (!isConnected || !address) {
      throw new Error('Please connect your wallet first')
    }

    setIsAuthenticating(true)
    setError(null)
    
    try {
      // Step 1: Get nonce
      const nonceResponse = await fetch('/api/auth/issue-nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      })

      if (!nonceResponse.ok) {
        const errorData = await nonceResponse.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to get nonce')
      }

      const { nonce } = await nonceResponse.json()

      // Step 2: Sign message with wallet (using wagmi)
      const message = `Login to Unlockr:\nNonce: ${nonce}`
      const signature = await signMessageAsync({ message })

      // Step 3: Verify signature and get JWT
      const verifyResponse = await fetch('/api/auth/verify-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature })
      })

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json().catch(() => ({}))
        throw new Error(errorData.error || 'Signature verification failed')
      }

      const { token } = await verifyResponse.json()
      return token

    } catch (error: any) {
      console.error('Authentication failed:', error)
      setError(error.message)
      throw error
    } finally {
      setIsAuthenticating(false)
    }
  }

  return {
    authenticate,
    isAuthenticating,
    isWalletConnected: isConnected,
    walletAddress: address,
    error,
    clearError: () => setError(null)
  }
}
