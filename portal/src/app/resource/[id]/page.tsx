"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import { useResource } from "@/hooks/useContract"
import { useResourceDisplay } from "@/hooks/useResourceDisplay"
import { useResourceActions } from "@/hooks/useResourceActions"
import { useContractWrites } from "@/hooks/useContractWrites"
import { mockEvents } from "@/data/mockEvents"
import { EventFeed } from "@/components/activity/event-feed"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, AlertCircle } from "lucide-react"
import type { Resource } from "@san-dev/access-contract-decoder"

export default function Page() {
  const params = useParams()
  const id = params.id as string
  const resourceId = BigInt(id)
  
  // Fetch resource data
  const { data: resourceData, isLoading, error } = useResource(resourceId)
  
  // Contract writes for buying
  const { buyResource, isPending, isSuccess, error: buyError } = useContractWrites()
  
  // Use proper types from your decoder package
  const resource = resourceData as Resource | undefined

  // ✅ MOVE ALL HOOKS TO TOP - before any conditional returns
  const resourceDisplay = useResourceDisplay(resource)
  const { buttonState } = useResourceActions(resourceId, resource)
  
  const [showRaw, setShowRaw] = useState(false)
  const resourceEvents = mockEvents.filter(e => e.resource === id)

  // Handle successful purchase
  if (isSuccess) {
    toast.success("Resource purchased successfully!")
  }

  // Handle buy action
  const handleBuy = async () => {
    if (!resource) return
    
    try {
      await buyResource(resourceId, resource.price)
    } catch (error) {
      toast.error("Failed to purchase resource")
    }
  }

  const handleCopyTx = (txHash: string) => {
    navigator.clipboard.writeText(txHash)
    toast.success("Transaction hash copied")
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading resource...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !resource) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Resource Not Found</h3>
              <p className="text-muted-foreground">
                {error?.message || "The requested resource could not be found"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get button text based on state
  const getButtonText = () => {
    switch (buttonState.type) {
      case 'connect': return 'Connect Wallet'
      case 'switch': return 'Switch Network'
      case 'owned': return 'Already Purchased'
      case 'buying': return 'Processing...'
      case 'your-resource': return 'Your Resource'
      case 'buy': return `Buy for ${resourceDisplay.priceDisplay}`
      default: return 'Buy Resource'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{resourceDisplay.name}</h1>
          <div className="flex items-center gap-2">
            <Badge variant={resourceDisplay.statusDisplay.variant}>
              {resourceDisplay.typeDisplay}
            </Badge>
            <Badge variant={resourceDisplay.statusDisplay.variant}>
              {resourceDisplay.statusDisplay.text}
            </Badge>
          </div>
        </div>
        <Button 
          onClick={buttonState.action || handleBuy}
          disabled={buttonState.disabled || isPending}
          className="px-8"
        >
          {buttonState.loading || isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            getButtonText()
          )}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-muted-foreground mb-2">Description</h4>
              <p className="text-muted-foreground">{resourceDisplay.description}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Owner</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {resourceDisplay.sellerDisplay}
              </code>
            </div>
            <div>
              <h4 className="font-medium mb-2">Price</h4>
              <div className="text-2xl font-bold text-primary">
                {resourceDisplay.priceDisplay}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Created</h4>
              <div className="text-sm text-muted-foreground">
                {new Date(Number(resource.createdAt) * 1000).toLocaleDateString()}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Type</h4>
              <Badge variant="outline">{resourceDisplay.typeDisplay}</Badge>
            </div>
            {resource.url && (
              <div>
                <h4 className="font-medium mb-2">URL</h4>
                <code className="text-sm bg-muted px-2 py-1 rounded break-all">
                  {resource.url}
                </code>
              </div>
            )}
            {resource.cid && (
              <div>
                <h4 className="font-medium mb-2">IPFS CID</h4>
                <code className="text-sm bg-muted px-2 py-1 rounded break-all">
                  {resource.cid}
                </code>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <EventFeed
              events={resourceEvents}
              showRaw={showRaw}
              onToggleRaw={setShowRaw}
              onCopyTx={handleCopyTx}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
