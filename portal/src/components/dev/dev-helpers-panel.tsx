"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Settings, Copy, ExternalLink, Zap, Wallet, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useWithdrawActions } from "@/hooks/useWithdrawActions"
import { useWithdrawDisplay } from "@/hooks/useWithdrawDisplay"

interface DevHelpersPanelProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DevHelpersPanel({ open, onOpenChange }: DevHelpersPanelProps) {
  const [showRawLogs, setShowRawLogs] = useState(false)
  const [simulateTx, setSimulateTx] = useState(false)

  // Use the withdraw hooks directly for better dev experience
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

  const handleCopyExampleCurl = () => {
    const exampleCurl = `curl -X POST http://localhost:3000/api/resources \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{"name":"Test Resource","price":"0.01","description":"Example"}'`
    
    navigator.clipboard.writeText(exampleCurl)
    toast.success("cURL example copied to clipboard")
    console.log("Example cURL:", exampleCurl)
  }

  const handleCopyTxLink = () => {
    const exampleTxLink = "https://sepolia.etherscan.io/tx/0x123...abc"
    navigator.clipboard.writeText(exampleTxLink)
    toast.success("Example transaction link copied")
    console.log("Example TX link:", exampleTxLink)
  }

  const content = (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="raw-logs" className="text-sm font-medium">
            Show Raw Logs
          </Label>
          <Switch
            id="raw-logs"
            checked={showRawLogs}
            onCheckedChange={(checked) => {
              setShowRawLogs(checked)
              console.log("Raw logs:", checked ? "enabled" : "disabled")
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="simulate-tx" className="text-sm font-medium">
            Simulate Transactions
          </Label>
          <Switch
            id="simulate-tx"
            checked={simulateTx}
            onCheckedChange={(checked) => {
              setSimulateTx(checked)
              console.log("Simulate TX:", checked ? "enabled" : "disabled")
            }}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleCopyExampleCurl}
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy Example cURL
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleCopyTxLink}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Copy TX Link
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => {
            console.log("Triggering mock transaction...")
            toast.info("Mock transaction triggered (check console)")
          }}
        >
          <Zap className="w-4 h-4 mr-2" />
          Trigger Mock TX
        </Button>

        <div className="pt-2 border-t space-y-3">
          <div className="text-xs text-muted-foreground">
            <div className="grid grid-cols-2 gap-1">
              <span>Balance:</span> 
              <span className="font-mono">{balanceLoading ? 'Loading...' : balanceFormatted}</span>
              <span>State:</span> 
              <span className="font-mono text-blue-600">{buttonState.type}</span>
              <span>Can Withdraw:</span> 
              <span className="font-mono">{buttonState.hasBalance ? 'Yes' : 'No'}</span>
            </div>
          </div>
          
          <Button
            size="sm"
            variant={buttonState.hasBalance ? "default" : "outline"}
            onClick={handleWithdrawClick}
            disabled={buttonState.disabled}
            className="w-full"
          >
            {buttonState.loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Wallet className="w-4 h-4 mr-2" />
            )}
            {buttonState.text}
          </Button>
        </div>
      </div>

      <div className="pt-4 border-t">
        <p className="text-xs text-muted-foreground">
          Debug mode active. All actions log to console.
        </p>
      </div>
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
      <SheetContent className="glass">
        <SheetHeader>
          <SheetTitle>Dev Helpers</SheetTitle>
        </SheetHeader>
        <div className="m-6">{content}</div>
      </SheetContent>
    </Sheet>
  )
}
