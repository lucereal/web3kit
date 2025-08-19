/**
 * Complete Example: Using the Web3 Authentication System
 * 
 * This file demonstrates how to use the unified authentication system
 * with wallet connection, JWT authentication, and contract interactions.
 */

import { useAuth } from '@/contexts/AuthContext'
import { useBackendApi, useUserApi } from '@/hooks/useBackendApi'
import { useWalletAuth } from '@/hooks/useWalletAuth'
import { useContractWrites, parseEthToWei } from '@/lib/contract-writes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState } from 'react'

export function CompleteWeb3Example() {
  const { address, isConnected } = useAccount()
  const { isAuthenticated, jwt, authenticate, logout, error: authError } = useAuth()
  
  // Backend API hooks
  const { get, post, isLoading: apiLoading, error: apiError } = useBackendApi()
  const { getUserResources, getUserPurchases } = useUserApi()
  
  // Contract interaction hook
  const { 
    createResource, 
    buyResource, 
    withdrawEarnings,
    isPending: contractPending, 
    isSuccess, 
    error: contractError,
    hash 
  } = useContractWrites()

  const [resourceId, setResourceId] = useState('')
  const [results, setResults] = useState<any>(null)

  // Authentication flow
  const handleAuthenticate = async () => {
    try {
      const success = await authenticate()
      if (success) {
        console.log('✅ Full authentication successful!')
        setResults({ type: 'success', message: 'Authentication successful!' })
      }
    } catch (err: any) {
      console.error('❌ Authentication failed:', err)
      setResults({ type: 'error', message: `Auth failed: ${err.message}` })
    }
  }

  // Backend API examples
  const handleGetMyResources = async () => {
    if (!address) return
    
    try {
      const resources = await getUserResources(address)
      setResults({ type: 'data', title: 'My Resources', data: resources })
    } catch (err: any) {
      setResults({ type: 'error', message: err.message })
    }
  }

  const handleGetMyPurchases = async () => {
    if (!address) return
    
    try {
      const purchases = await getUserPurchases(address)
      setResults({ type: 'data', title: 'My Purchases', data: purchases })
    } catch (err: any) {
      setResults({ type: 'error', message: err.message })
    }
  }

  // Contract interaction examples
  const handleCreateSampleResource = async () => {
    try {
      await createResource({
        name: 'Sample Resource',
        description: 'Created using the unified Web3 system',
        cid: 'QmSampleHash123',
        url: 'https://example.com/resource',
        serviceId: 'demo-service-' + Date.now(),
        price: parseEthToWei('0.001'), // 0.001 ETH
        resourceType: 0
      })
      setResults({ type: 'success', message: 'Resource creation initiated!' })
    } catch (err: any) {
      setResults({ type: 'error', message: err.message })
    }
  }

  const handleBuyResource = async () => {
    if (!resourceId) {
      setResults({ type: 'error', message: 'Please enter a resource ID' })
      return
    }

    try {
      await buyResource(
        BigInt(resourceId), 
        parseEthToWei('0.001') // 0.001 ETH
      )
      setResults({ type: 'success', message: 'Purchase initiated!' })
    } catch (err: any) {
      setResults({ type: 'error', message: err.message })
    }
  }

  const handleWithdraw = async () => {
    try {
      await withdrawEarnings()
      setResults({ type: 'success', message: 'Withdrawal initiated!' })
    } catch (err: any) {
      setResults({ type: 'error', message: err.message })
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Complete Web3 Authentication & Interaction Demo</CardTitle>
          <CardDescription>
            This demonstrates the full flow: wallet connection → authentication → backend API → smart contracts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Step 1: Wallet Connection */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">1. Connect Wallet</h3>
            <ConnectButton />
            {address && (
              <p className="text-sm text-gray-600">
                ✅ Wallet connected: {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            )}
          </div>

          {/* Step 2: Backend Authentication */}
          {isConnected && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">2. Backend Authentication</h3>
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm">
                  Status: {isAuthenticated ? 'Authenticated ✅' : 'Not authenticated ❌'}
                </span>
              </div>
              
              {!isAuthenticated ? (
                <Button onClick={handleAuthenticate} disabled={apiLoading}>
                  {apiLoading ? 'Signing message...' : 'Sign Message to Authenticate'}
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-green-600">✅ You can now access backend APIs</p>
                  <Button onClick={logout} variant="outline" size="sm">
                    Logout
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Backend API Calls */}
          {isAuthenticated && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">3. Backend API Access</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button 
                  onClick={handleGetMyResources} 
                  disabled={apiLoading}
                  variant="outline"
                >
                  {apiLoading ? 'Loading...' : 'Get My Resources'}
                </Button>
                <Button 
                  onClick={handleGetMyPurchases} 
                  disabled={apiLoading}
                  variant="outline"
                >
                  {apiLoading ? 'Loading...' : 'Get My Purchases'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Smart Contract Interactions */}
          {isConnected && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">4. Smart Contract Interactions</h3>
              <p className="text-sm text-gray-600">
                These work with wallet connection only (no backend auth required)
              </p>
              
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button 
                    onClick={handleCreateSampleResource} 
                    disabled={contractPending}
                    variant="default"
                  >
                    {contractPending ? 'Processing...' : 'Create Resource'}
                  </Button>
                  
                  <Button 
                    onClick={handleWithdraw} 
                    disabled={contractPending}
                    variant="secondary"
                  >
                    {contractPending ? 'Processing...' : 'Withdraw Earnings'}
                  </Button>
                  
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={resourceId}
                      onChange={(e) => setResourceId(e.target.value)}
                      placeholder="Resource ID"
                      className="flex-1 px-3 py-1 text-sm border rounded"
                    />
                    <Button 
                      onClick={handleBuyResource} 
                      disabled={contractPending || !resourceId}
                      size="sm"
                    >
                      Buy
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Display */}
          {results && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Results</h3>
              <div className={`p-4 rounded-lg border ${
                results.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
                results.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
                'bg-blue-50 border-blue-200 text-blue-700'
              }`}>
                {results.title && <h4 className="font-medium mb-2">{results.title}</h4>}
                {results.message && <p className="text-sm">{results.message}</p>}
                {results.data && (
                  <pre className="text-xs mt-2 bg-white p-2 rounded border overflow-x-auto">
                    {JSON.stringify(results.data, null, 2)}
                  </pre>
                )}
              </div>
              <Button onClick={() => setResults(null)} size="sm" variant="ghost">
                Clear Results
              </Button>
            </div>
          )}

          {/* Transaction Success */}
          {isSuccess && hash && (
            <div className="p-4 bg-green-50 border border-green-200 rounded text-green-700">
              <p className="font-medium">Transaction Successful! 🎉</p>
              <p className="text-sm mt-1">Hash: {hash.slice(0, 10)}...{hash.slice(-8)}</p>
            </div>
          )}

          {/* Error Display */}
          {(authError || apiError || contractError) && (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
              <p className="font-medium">Error:</p>
              <p className="text-sm">{authError || apiError || contractError}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Architecture Summary */}
      <Card>
        <CardHeader>
          <CardTitle>System Architecture Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <p><strong>useAuth():</strong> JWT authentication state and wallet connection</p>
            <p><strong>useBackendApi():</strong> Authenticated API calls with error handling</p>
            <p><strong>useContractWrites():</strong> Smart contract interactions with automatic wallet checks</p>
            <p><strong>AuthProvider:</strong> Wraps your app to provide authentication context</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
