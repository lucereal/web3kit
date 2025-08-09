'use client'
import { useEffect, useState } from "react"
import { TxStep } from "@/lib/tx"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle, ExternalLink, X } from "lucide-react"

interface TxDrawerProps {
  open?: boolean
  step?: TxStep
  txHash?: string
  block?: number
  errorMessage?: string
  onClose?: () => void
}

const stepProgress = {
  prepare: 25,
  sign: 50,
  pending: 75,
  confirmed: 100,
  error: 0
}

const stepLabels = {
  prepare: "Preparing transaction...",
  sign: "Please sign in your wallet",
  pending: "Transaction pending",
  confirmed: "Transaction confirmed!",
  error: "Transaction failed"
}

const stepIcons = {
  prepare: Clock,
  sign: Clock,
  pending: Clock,
  confirmed: CheckCircle,
  error: AlertCircle
}

export function TxDrawer({ 
  open = false, 
  step = 'prepare', 
  txHash, 
  block, 
  errorMessage, 
  onClose 
}: TxDrawerProps) {
  const [isOpen, setIsOpen] = useState(open)
  
  useEffect(() => {
    setIsOpen(open)
  }, [open])

  const Icon = stepIcons[step]
  const progress = stepProgress[step]
  const label = stepLabels[step]

  const handleClose = () => {
    setIsOpen(false)
    onClose?.()
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent className="mx-auto max-w-md">
        <DrawerHeader className="text-center">
          <div className="flex items-center justify-between">
            <DrawerTitle>Transaction Status</DrawerTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DrawerHeader>
        
        <div className="px-6 pb-6 space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className={`p-3 rounded-full ${
              step === 'confirmed' ? 'bg-pink-accent/20 text-pink-accent' :
              step === 'error' ? 'bg-red-500/10 text-red-400' :
              'bg-blue-accent/20 text-blue-accent'
            }`}>
              <Icon className="w-6 h-6" />
            </div>
            
            <div className="text-center space-y-2">
              <p className="font-medium">{label}</p>
              {step === 'error' && errorMessage && (
                <p className="text-sm text-red-400">{errorMessage}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {txHash && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-accent-muted">Transaction Hash</p>
              <div className="flex items-center gap-2 p-2 bg-muted rounded">
                <code className="text-xs flex-1 truncate text-blue-accent">{txHash}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`https://sepolia.etherscan.io/tx/${txHash}`, '_blank')}
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          {block && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-accent-muted">Block Number</span>
              <Badge variant="secondary" className="bg-blue-accent/20 text-blue-accent">{block}</Badge>
            </div>
          )}

          {step === 'confirmed' && (
            <Button variant="pink" onClick={handleClose} className="w-full">
              Close
            </Button>
          )}
          
          {step === 'error' && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Close
              </Button>
              <Button variant="pink" onClick={() => window.location.reload()} className="flex-1">
                Retry
              </Button>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
