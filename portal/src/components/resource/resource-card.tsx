"use client"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, ShoppingCart } from "lucide-react"

interface ResourceCardProps {
  id: string
  name: string
  description: string
  priceEth: string
  seller: string
  category?: string
  isActive?: boolean
  onView?: (id: string) => void
  onBuy?: (id: string) => void
}

export function ResourceCard({
  id,
  name,
  description,
  priceEth,
  seller,
  category,
  isActive = true,
  onView,
  onBuy
}: ResourceCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">{name}</h3>
          {category && (
            <Badge variant="secondary" className="text-xs shrink-0">
              {category}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">{priceEth} ETH</span>
          {!isActive && (
            <Badge variant="outline" className="text-xs">
              Inactive
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          <span>Seller: </span>
          <code className="px-1 py-0.5 bg-muted rounded text-xs">
            {seller.slice(0, 6)}...{seller.slice(-4)}
          </code>
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2 pt-0">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onView?.(id)}
        >
          <Eye className="w-3 h-3 mr-1" />
          View
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => onBuy?.(id)}
          disabled={!isActive}
        >
          <ShoppingCart className="w-3 h-3 mr-1" />
          Buy
        </Button>
      </CardFooter>
    </Card>
  )
}
