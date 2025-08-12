"use client"
import { Badge } from "@/components/ui/badge"

interface ResourceContentProps {
  description: string
  price: string
  seller: string
  status?: { text: string; variant: 'default' | 'secondary' | 'outline' }
  hasAccess?: boolean
  className?: string
}

export function ResourceContent({ 
  description, 
  price, 
  seller, 
  status, 
  hasAccess,
  className 
}: ResourceContentProps) {
  return (
    <div className={`flex-1 space-y-3 ${className || ''}`}>
      <p className="text-xs text-muted-foreground line-clamp-2">
        {description}
      </p>
      
      <div className="flex items-center justify-between">
        <span className={`text-lg font-bold text-foreground`}>
          {price}
        </span>
        <div className="flex gap-1">
          {status && !status.text.includes('Active') && (
            <Badge variant={status.variant} className="text-xs">
              {status.text}
            </Badge>
          )}
          {hasAccess && (
            <Badge variant="default" className="text-xs ">
              Owned
            </Badge>
          )}
        </div>
      </div>
      
      <div className={`text-xs text-foreground`}>
        <span>Seller: </span>
        <code className="px-1 py-0.5 bg-muted rounded text-xs ">
          {seller}
        </code>
      </div>
    </div>
  )
}
