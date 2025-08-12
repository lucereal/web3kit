"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Settings, Copy, ExternalLink, Zap } from "lucide-react"
import { toast } from "sonner"
import { WithdrawButton } from "@/components/contract/withdraw-button"

interface DevHelpersPanelProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DevHelpersPanel({ open, onOpenChange }: DevHelpersPanelProps) {
  const [showRawLogs, setShowRawLogs] = useState(false)
  const [simulateTx, setSimulateTx] = useState(false)

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

        <div className="pt-2 border-t">
          <WithdrawButton />
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
