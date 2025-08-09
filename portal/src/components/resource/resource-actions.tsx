"use client"
import { Button } from "@/components/ui/button"
import { Eye, ShoppingCart, CheckCircle, Loader2 } from "lucide-react"
import type { ButtonState } from "@/hooks/useResourceActions"

interface ResourceActionsProps {
  buttonState: ButtonState
  onView?: () => void
  className?: string
}

const buttonContent = {
  connect: { icon: ShoppingCart, text: "Connect Wallet" },
  switch: { icon: Loader2, text: "Switch Network" },
  owned: { icon: CheckCircle, text: "Owned" },
  buying: { icon: Loader2, text: "Buying..." },
  buy: { icon: ShoppingCart, text: "Buy" },
  'your-resource': { icon: Eye, text: "Your Resource" },
}

export function ResourceActions({ buttonState, onView, className }: ResourceActionsProps) {
  const content = buttonContent[buttonState.type]
  const IconComponent = content.icon

  return (
    <div className={`flex gap-2 pt-0 ${className || ''}`}>
      <Button
        variant="outline"
        size="sm"
        className="flex-1"
        onClick={onView}
      >
        <Eye className="w-3 h-3 mr-1" />
        View
      </Button>
      
      <Button
        variant={buttonState.type === 'buy' ? 'pink' : 'default'}
        size="sm"
        className="flex-1"
        onClick={buttonState.action}
        disabled={buttonState.disabled}
      >
        <IconComponent 
          className={`w-3 h-3 mr-1 ${buttonState.loading ? 'animate-spin' : ''}`} 
        />
        {content.text}
      </Button>
    </div>
  )
}
