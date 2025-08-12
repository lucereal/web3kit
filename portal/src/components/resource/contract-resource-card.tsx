"use client"
import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, ShoppingCart, CheckCircle, Loader2 } from "lucide-react"
import { useAccount } from "wagmi"
import { useHasAccess } from "@/hooks/useContract"
import { useNetworkGuard } from "@/hooks/useNetworkGuard"
import { buyResource, formatWeiToEth, parseEthToWei } from "@/lib/contract-writes"
import { toast } from "sonner"
import type { Resource } from "@/data/resource"

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
  const { address, isConnected } = useAccount()
  const { data: hasAccess, refetch: refetchAccess } = useHasAccess(resourceId)
  const { wrong: wrongNetwork, onSwitch, isPending: switchPending } = useNetworkGuard()
  const [buying, setBuying] = useState(false)

  const priceEth = formatWeiToEth(resource.price)
  const resourceType = resource.resourceType === 0 ? 'URL' : 'IPFS'

  const handleBuy = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet")
      return
    }

    if (wrongNetwork) {
      toast.error("Please switch to Sepolia network")
      return
    }

    setBuying(true)
    try {
      const { hash } = await buyResource(resourceId, resource.price)
      toast.success("Purchase successful!", {
        description: `Transaction: ${hash.slice(0, 10)}...`,
        action: {
          label: "View on Etherscan",
          onClick: () => window.open(`https://sepolia.etherscan.io/tx/${hash}`, '_blank')
        }
      })
      // Refetch access status
      refetchAccess()
    } catch (error: any) {
      console.error("Buy error:", error)
      if (error.message?.includes("User rejected")) {
        toast.error("Transaction cancelled")
      } else {
        toast.error("Purchase failed", {
          description: error.message || "Unknown error occurred"
        })
      }
    } finally {
      setBuying(false)
    }
  }

  const handleView = () => {
    onView?.(resourceId)
  }

  const getActionButton = () => {
    if (!isConnected) {
      return (
        <Button size="sm" className="flex-1" disabled>
          <ShoppingCart className="w-3 h-3 mr-1" />
          Connect Wallet
        </Button>
      )
    }

    if (wrongNetwork) {
      return (
        <Button 
          size="sm" 
          className="flex-1" 
          onClick={onSwitch}
          disabled={switchPending}
        >
          {switchPending ? (
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          ) : (
            "Switch Network"
          )}
        </Button>
      )
    }

    if (hasAccess) {
      return (
        <Button size="sm" className="flex-1 bg-transparent" variant="outline" disabled>
          <CheckCircle className="w-3 h-3 mr-1" />
          Owned
        </Button>
      )
    }

    if (resource.owner.toLowerCase() === address?.toLowerCase()) {
      return (
        <Button size="sm" className="flex-1" variant="outline" disabled>
          <Eye className="w-3 h-3 mr-1" />
          Your Resource
        </Button>
      )
    }

    return (
      <Button
        variant="outline"
        size="sm"
        className="flex-1 bg-transparent"
        onClick={handleBuy}
        disabled={!resource.isActive || buying}
      >
        {buying ? (
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        ) : (
          <ShoppingCart className="w-3 h-3 mr-1" />
        )}
        {buying ? "Buying..." : "Buy"}
      </Button>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">
            {resource.name}
          </h3>
          <Badge variant="secondary" className="text-xs shrink-0">
            {resourceType}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {resource.description}
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold ">{priceEth} ETH</span>
          <div className="flex gap-1">
            {!resource.isActive && (
              <Badge variant="outline" className="text-xs ">
                Inactive
              </Badge>
            )}
            {!!hasAccess && (
              <Badge variant="secondary" className="text-xs ">
                Owned
              </Badge>
            )}
          </div>
        </div>
        <div className="text-xs ">
          <span>Seller: </span>
          <code className="px-1 py-0.5 bg-muted rounded text-xs">
            {resource.owner.slice(0, 6)}...{resource.owner.slice(-4)}
          </code>
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2 pt-0">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={handleView}
        >
          <Eye className="w-3 h-3 mr-1" />
          View
        </Button>
        {getActionButton()}
      </CardFooter>
    </Card>
  )
}
