"use client"
import { ActivityEvent } from "@/hooks/useActivityEvents"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  ShoppingCart, 
  List, 
  Banknote, 
  ArrowRightLeft,
  Copy,
  ExternalLink
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface EventFeedProps {
  events: ActivityEvent[]
  showRaw?: boolean
  onToggleRaw?: (show: boolean) => void
  onCopyTx?: (txHash: string) => void
}

const eventIcons = {
  purchase: ShoppingCart,
  listing: List,
  withdrawal: Banknote,
  transfer: ArrowRightLeft,
}

const eventColors = {
  purchase: "bg-pine-green text-mint-green border-mint-green",
  listing: "bg-pine-green text-mint-green border-mint-green",
  withdrawal: "bg-pine-green text-mint-green border-mint-green",
  transfer: "bg-pine-green text-mint-green border-mint-green",
}

export function EventFeed({ events, showRaw = false, onToggleRaw, onCopyTx }: EventFeedProps) {
  return (
    <div className="space-y-4">
      {onToggleRaw && (
        <div className="flex items-center space-x-2">
          <Switch
            id="raw-mode"
            checked={showRaw}
            onCheckedChange={onToggleRaw}
          />
          <Label htmlFor="raw-mode" className="text-sm">Show raw logs</Label>
        </div>
      )}
      
      <div className="space-y-3">
        {events.map((event) => {
          const Icon = eventIcons[event.type]
          const colorClass = eventColors[event.type]
          
          return (
            <Card key={event.id} className="p-4" variant="glass">
              <CardContent className="p-0">
                {showRaw ? (
                  <div className="space-y-2">
                    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                      {JSON.stringify(event, null, 2)}
                    </pre>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCopyTx?.(event.txHash)}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy TX
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {event.type}
                        </Badge>
                        {/* <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                        </span> */}
                      </div>
                      
                      <div className="text-sm space-y-1">
                        <div>
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">
                            {event.actor.slice(0, 6)}...{event.actor.slice(-4)}
                          </code>
                          <span className="mx-2">
                            {event.type === 'purchase' && 'purchased'}
                            {event.type === 'listing' && 'listed'}
                            {event.type === 'withdrawal' && 'withdrew'}
                            {event.type === 'transfer' && 'transferred'}
                          </span>
                          {event.resourceName && (
                            <span className="font-medium">{event.resourceName}</span>
                          )}
                          {event.amount && (
                            <span className="ml-2 text-foreground font-medium">
                              {event.amount} ETH
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Block {event.blockNumber}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={() => onCopyTx?.(event.txHash)}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            {event.txHash.slice(0, 8)}...
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
