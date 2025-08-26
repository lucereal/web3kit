"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, X, Eye } from "lucide-react"
import { formatWeiToEth } from "@/utils/blockchain"
import { useRouter } from "next/navigation"

interface CreatedResource {
  name: string
  description: string
  price: string // ETH string
  resourceType: "URL" | "IPFS"
  category: string
  url?: string
  cid?: string
  serviceId?: string
  txHash: string
  resourceId?: string | bigint // Add resource ID for routing
}

interface ResourceSuccessModalProps {
  open: boolean
  onClose: () => void
  resource: CreatedResource | null
}

export function ResourceSuccessModal({
  open,
  onClose,
  resource
}: ResourceSuccessModalProps) {
  const router = useRouter()

  if (!resource) return null

  const handleViewResource = () => {
    if (resource.resourceId) {
      router.push(`/resource/${resource.resourceId}`)
    } else {
      // Fallback if no resource ID available
      router.push('/explore')
    }
  }

  const handleViewOnEtherscan = () => {
    window.open(`https://sepolia.etherscan.io/tx/${resource.txHash}`, '_blank')
  }

    const handleView = (id: string | bigint) => {
    router.push(`/resource/${id}`)
  }

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-2xl" variant="glass" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-pine-green flex items-center gap-2">
              🎉 Resource Created Successfully!
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Your resource has been successfully created and published on the blockchain.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resource Preview Card */}
          <Card variant="default">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-mint-green" >{resource.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{resource.category}</Badge>
                    <Badge variant="secondary">
                      {resource.resourceType}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-mint-green">{resource.price} ETH</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-mint-green mb-4">{resource.description}</p>
              
              {/* Resource Details */}
              <div className="space-y-2 text-sm text-mint-green">
                {resource.resourceType === "URL" && resource.url && (
                  <div>
                    <span className="font-medium text-mint-green">URL:</span>
                    <span className="ml-2 text-mint-green break-all">{resource.url}</span>
                  </div>
                )}
                
                {resource.resourceType === "IPFS" && resource.cid && (
                  <div>
                    <span className="font-medium text-mint-green">IPFS CID:</span>
                    <span className="ml-2 text-mint-green break-all">{resource.cid}</span>
                  </div>
                )}
                
                {resource.serviceId && (
                  <div>
                    <span className="font-medium text-mint-green">Service ID:</span>
                    <span className="ml-2 text-mint-green">{resource.serviceId}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Transaction Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Transaction Confirmed</div>
                <div className="text-sm text-mint-green">
                  Hash: {resource.txHash.slice(0, 10)}...{resource.txHash.slice(-8)}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleViewOnEtherscan}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Etherscan
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleViewResource} className="flex-1">
              <Eye className="h-4 w-4 mr-2" />
              View Resource Page
            </Button>
            <Button variant="default" onClick={onClose} className="flex-1">
              Create Another Resource
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
