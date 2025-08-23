"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Settings, Copy, ExternalLink, Zap, Wallet, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useWithdrawActions } from "@/hooks/useWithdrawActions"
import { useWithdrawDisplay } from "@/hooks/useWithdrawDisplay"
import EventProviderDebugPanel from "./event-provider-debug-panel"

interface DevHelpersPanelProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DevHelpersPanel({ open, onOpenChange }: DevHelpersPanelProps) {
  // Use the withdraw hooks for testing
  const { buttonState, handleAction } = useWithdrawActions()
  const { balanceFormatted, hasBalance, isLoading: balanceLoading } = useWithdrawDisplay()

  const handleWithdrawClick = async () => {
    console.log('Dev Panel: Withdraw action triggered', {
      buttonState,
      hasBalance,
      balance: balanceFormatted
    })

    if (handleAction) {
      try {
        await handleAction()
        if (buttonState.type === 'withdraw') {
          toast.success("Withdrawal initiated!")
          console.log('Dev Panel: Withdrawal successful')
        }
      } catch (error: any) {
        console.error('Dev Panel: Withdrawal failed', error)
        if (error.message?.includes('User rejected')) {
          toast.error("Transaction cancelled")
        } else {
          toast.error("Withdrawal failed", {
            description: error.message || "Unknown error occurred"
          })
        }
      }
    } else {
      console.log('Dev Panel: No action available for current state:', buttonState.type)
      switch (buttonState.type) {
        case 'connect':
          toast.info("Please connect your wallet to withdraw earnings")
          break
        case 'no-balance':
          toast.info("No earnings available to withdraw")
          break
      }
    }
  }


  const content = (
    <div className="space-y-6">
      
      {/* Simple Dev Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Withdraw Test Button */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Test Withdrawal</Label>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleWithdrawClick}
                disabled={!hasBalance || balanceLoading || buttonState.loading}
                className="flex-1"
              >
                {buttonState.loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wallet className="w-4 h-4 mr-2" />
                )}
                {buttonState.text}
              </Button>
              {hasBalance && (
                <span className="text-sm text-muted-foreground">
                  {balanceFormatted} ETH
                </span>
              )}
            </div>
          </div>
          
          {/* Console Helpers */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Console Commands</Label>
            <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded font-mono">
              <div>window.web3kit.eventStatus - Check event fetching status</div>
              <div>window.testEtherscan() - Test Etherscan connection</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Always show the Event Provider Debug Panel - controlled by navigation toggle */}
      <EventProviderDebugPanel />
    </div>
  )

  if (open !== undefined && onOpenChange) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Dev Helpers</SheetTitle>
          </SheetHeader>
          <div className="mt-6">{content}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Dev Tools
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Dev Helpers</SheetTitle>
        </SheetHeader>
        <div className="mt-6">{content}</div>
      </SheetContent>
    </Sheet>
  )
}
