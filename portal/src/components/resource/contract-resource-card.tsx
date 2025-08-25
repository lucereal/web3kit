"use client"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, ShoppingCart, CheckCircle, Loader2 } from "lucide-react"
import { useResourceDisplay } from "@/hooks/useResourceDisplay"
import { useResourceActions } from "@/hooks/useResourceActions"
import { toast } from "sonner"
import type { Resource } from "@san-dev/access-contract-decoder"

interface ContractResourceCardProps {
  resourceId: bigint
  resource: Resource
  onView?: (id: bigint) => void
}

export function ContractResourceCard({
  resourceId,
  resource,
  onView
}: ContractResourceCardProps) {
  // Use centralized display formatting
  const resourceDisplay = useResourceDisplay(resource)
  
  // Use centralized action logic
  const { buttonState } = useResourceActions(resourceId, resource)

  const handleAction = () => {
    if (buttonState.action) {
      buttonState.action()
    } else if (buttonState.type === 'connect') {
      toast.info("Please connect your wallet to purchase resources")
    }
  }

  const getButtonVariant = () => {
    switch (buttonState.type) {
      case 'connect':
      case 'switch':
        return "pine" as const
      case 'owned':
      case 'your-resource':
        return "pine" as const
      default:
        return "default" as const
    }
  }

  const getButtonContent = () => {
    switch (buttonState.type) {
      case 'connect':
        return (
          <>
            <ShoppingCart className="h-4 w-4 mr-2" />
            <span className="text-mint-green">Connect Wallet</span>
          </>
        )
      case 'switch':
        return (
          <>
            {buttonState.loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4 mr-2" />
            )}
            <span className="text-mint-green">Switch Network</span>
          </>
        )
      case 'owned':
        return (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            <span className="text-mint-green">Already Purchased</span>
          </>
        )
      case 'your-resource':
        return (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            <span className="text-mint-green">Your Resource</span>
          </>
        )
      case 'buying':
        return (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            <span className="text-mint-green">Processing...</span>
          </>
        )
      case 'buy':
        return (
          <>
            <ShoppingCart className="h-4 w-4 mr-2" />
            <span className="text-mint-green">Buy for {resourceDisplay.priceDisplay}</span>
          </>
        )
      default:
        return (
          <>
            <ShoppingCart className="h-4 w-4 mr-2" />
            <span className="text-mint-green">Buy Resource</span>
          </>
        )
    }
  }

  return (
    <Card variant="glass" className="group hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-medium line-clamp-1 text-mint-green">
              {resourceDisplay.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="pine" className="text-xs">
                {resourceDisplay.typeDisplay}
              </Badge>
              <Badge variant="pine" className="text-xs">
                {resourceDisplay.statusDisplay.text}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-redwood">
              {resourceDisplay.priceDisplay}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-3">
        <p className="text-sm text-mint-green line-clamp-2 mb-3">
          {resourceDisplay.description}
        </p>
        
        <div className="space-y-2">
          <div className="text-xs text-mint-green">
            <span className="font-medium text-mint-green">Owner:</span> {resourceDisplay.sellerDisplay}
          </div>
          
          {resource.url && (
            <div className="text-xs text-mint-green truncate">
              <span className="font-medium">URL:</span> {resource.url}
            </div>
          )}
          
          {resource.cid && (
            <div className="text-xs text-mint-green truncate">
              <span className="font-medium">IPFS:</span> {resource.cid}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex gap-2">
        <Button
          size="sm"
          variant="pine"
          onClick={() => onView?.(resourceId)}
          className="flex-1"
        >
          <Eye className="h-4 w-4 mr-2" />
          <span className="text-mint-green">View Details</span>
        </Button>
        
        <Button
          size="sm"
          variant={getButtonVariant()}
          onClick={handleAction}
          disabled={buttonState.disabled}
          className="flex-1"
        >
          {getButtonContent()}
        </Button>
      </CardFooter>
    </Card>
  )
}
