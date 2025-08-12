"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import { mockResources } from "@/data/mockResources"
import { mockEvents } from "@/data/mockEvents"
import { EventFeed } from "@/components/activity/event-feed"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTx } from "@/lib/tx"
import { TxDrawer } from "@/components/app/tx-drawer"
import { toast } from "sonner"

export default function Page() {
  const params = useParams()
  const id = params.id as string
  const { step, txHash, block, errorMessage, write, reset } = useTx()
  const [showTxDrawer, setShowTxDrawer] = useState(false)
  const [showRaw, setShowRaw] = useState(false)

  const resource = mockResources.find(r => r.id === id)
  const resourceEvents = mockEvents.filter(e => e.resource === id)

  if (!resource) {
    return <div>Resource not found</div>
  }

  const handleBuy = async () => {
    setShowTxDrawer(true)
    await write()
  }

  const handleCloseTxDrawer = () => {
    setShowTxDrawer(false)
    reset()
  }

  const handleCopyTx = (txHash: string) => {
    navigator.clipboard.writeText(txHash)
    toast.success("Transaction hash copied")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{resource.name}</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{resource.category}</Badge>
            {!resource.isActive && (
              <Badge variant="outline">Inactive</Badge>
            )}
          </div>
        </div>
        <Button 
          onClick={handleBuy}
          disabled={!resource.isActive}
          className="px-8"
        >
          Buy for {resource.priceEth} ETH
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-muted-foreground">{resource.description}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Seller</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {resource.seller}
              </code>
            </div>
            <div>
              <h4 className="font-medium mb-2">Price</h4>
              <div className="text-2xl font-bold text-primary">
                {resource.priceEth} ETH
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Created</h4>
              <div className="text-sm text-muted-foreground">
                {new Date(resource.createdAt).toLocaleDateString()}
              </div>
            </div>
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

      <TxDrawer
        open={showTxDrawer}
        step={step}
        txHash={txHash}
        block={block}
        errorMessage={errorMessage}
        onClose={handleCloseTxDrawer}
      />
    </div>
  )
}
