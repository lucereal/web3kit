import { useContractWrites, parseEthToWei } from '@/lib/contract-writes'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

/**
 * Simple example of using the unified useContractWrites hook
 */
export function SimpleContractExample() {
  const { 
    createResource, 
    buyResource, 
    withdrawEarnings,
    isPending, 
    isSuccess, 
    error,
    hash,
    isWalletConnected 
  } = useContractWrites()

  const [resourceId, setResourceId] = useState('')

  const handleCreateResource = async () => {
    try {
      await createResource({
        name: 'Example Resource',
        description: 'A sample resource created with the new hook',
        cid: 'QmExampleHash',
        url: 'https://example.com/resource',
        serviceId: 'demo-service',
        price: parseEthToWei('0.001'), // 0.001 ETH
        resourceType: 0
      })
    } catch (err) {
      console.error('Create resource failed:', err)
    }
  }

  const handleBuyResource = async () => {
    if (!resourceId) {
      alert('Please enter a resource ID')
      return
    }

    try {
      await buyResource(
        BigInt(resourceId), 
        parseEthToWei('0.001') // 0.001 ETH
      )
    } catch (err) {
      console.error('Buy resource failed:', err)
    }
  }

  const handleWithdraw = async () => {
    try {
      await withdrawEarnings()
    } catch (err) {
      console.error('Withdraw failed:', err)
    }
  }

  if (!isWalletConnected) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600 mb-4">Please connect your wallet to interact with the contract.</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Contract Interactions</h2>
      
      {/* Status Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          Error: {error}
        </div>
      )}
      
      {isSuccess && hash && (
        <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
          Success! Transaction: {hash.slice(0, 10)}...
        </div>
      )}

      {/* Resource ID Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Resource ID to Buy:</label>
        <input
          type="number"
          value={resourceId}
          onChange={(e) => setResourceId(e.target.value)}
          placeholder="0"
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button
          onClick={handleCreateResource}
          disabled={isPending}
          className="w-full"
        >
          {isPending ? 'Processing...' : 'Create Sample Resource'}
        </Button>

        <Button
          onClick={handleBuyResource}
          disabled={isPending || !resourceId}
          variant="outline"
          className="w-full"
        >
          {isPending ? 'Processing...' : 'Buy Resource'}
        </Button>

        <Button
          onClick={handleWithdraw}
          disabled={isPending}
          variant="secondary"
          className="w-full"
        >
          {isPending ? 'Processing...' : 'Withdraw Earnings'}
        </Button>
      </div>

      <div className="text-xs text-gray-500 mt-4">
        <p>✅ All operations automatically:</p>
        <ul className="list-disc ml-4 mt-1">
          <li>Check wallet connection</li>
          <li>Handle loading states</li>
          <li>Show user-friendly errors</li>
          <li>Require wallet signature</li>
        </ul>
      </div>
    </div>
  )
}
