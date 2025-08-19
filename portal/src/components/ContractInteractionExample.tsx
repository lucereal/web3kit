import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Wallet, AlertCircle } from 'lucide-react'
import { useAccount } from 'wagmi'
import { parseEther } from 'viem'
import { useContractWrites } from '@/lib/contract-writes'

export function ContractInteractionExample() {
  const { address, isConnected } = useAccount()
  
  // Using the unified hook approach
  const { 
    buyResource,
    createResource,
    withdrawEarnings,
    isPending, 
    isSuccess, 
    error, 
    hash,
    isWalletConnected 
  } = useContractWrites()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    resourceIdToBuy: ''
  })

  const handleBuyResource = async () => {
    try {
      const resourceId = BigInt(formData.resourceIdToBuy)
      const price = parseEther('0.001')
      
      await buyResource(resourceId, price)
    } catch (error) {
      console.error('Purchase failed:', error)
    }
  }

  const handleCreateResource = async () => {
    try {
      await createResource({
        name: formData.name,
        description: formData.description,
        cid: 'QmExample',
        url: 'https://example.com',
        serviceId: 'service123',
        price: parseEther(formData.price),
        resourceType: 0
      })
    } catch (error) {
      console.error('Creation failed:', error)
    }
  }

  const handleWithdraw = async () => {
    try {
      await withdrawEarnings()
    } catch (error) {
      console.error('Withdrawal failed:', error)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Wallet Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                {isConnected ? '✅ Connected' : '❌ Not Connected'}
              </span>
            </div>
            {isConnected && (
              <div className="flex justify-between">
                <span>Address:</span>
                <span className="text-sm font-mono">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contract Operations */}
      <Card>
        <CardHeader>
          <CardTitle>Blockchain Operations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Resource Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="My Resource"
              />
            </div>
            <div className="space-y-2">
              <Label>Price (ETH)</Label>
              <Input
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="0.001"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Resource description"
            />
          </div>

          <div className="space-y-2">
            <Label>Resource ID to Buy</Label>
            <Input
              value={formData.resourceIdToBuy}
              onChange={(e) => setFormData({...formData, resourceIdToBuy: e.target.value})}
              placeholder="0"
            />
          </div>
          
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}
          
          {isSuccess && hash && (
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-700">
                ✅ Transaction successful! 
                <br />
                <span className="font-mono text-xs">{hash}</span>
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={handleCreateResource}
              disabled={isPending || !isWalletConnected}
              variant="outline"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Resource'
              )}
            </Button>
            
            <Button
              onClick={handleBuyResource}
              disabled={isPending || !isWalletConnected || !formData.resourceIdToBuy}
              variant="outline"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Buying...
                </>
              ) : (
                'Buy Resource'
              )}
            </Button>

            <Button
              onClick={handleWithdraw}
              disabled={isPending || !isWalletConnected}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Withdrawing...
                </>
              ) : (
                'Withdraw Earnings'
              )}
            </Button>
          </div>
          
          <p className="text-xs text-gray-600">
            ✅ All operations require wallet connection and signature  
            ✅ Automatic loading states and error handling  
            ✅ Transaction status tracking
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
