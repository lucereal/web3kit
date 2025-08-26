"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, X, AlertTriangle } from "lucide-react"

interface ErrorDetails {
  message: string
  reason?: string
  code?: string | number
  txHash?: string
}

interface ResourceErrorModalProps {
  open: boolean
  onClose: () => void
  error: ErrorDetails | null
}

export function ResourceErrorModal({
  open,
  onClose,
  error
}: ResourceErrorModalProps) {
  if (!error) return null

  const handleViewOnEtherscan = () => {
    if (error.txHash) {
      window.open(`https://sepolia.etherscan.io/tx/${error.txHash}`, '_blank')
    }
  }

  const getErrorTitle = () => {
    if (error.message?.includes("User rejected") || error.code === 4001) {
      return "Transaction Cancelled"
    }
    if (error.message?.includes("insufficient funds")) {
      return "Insufficient Funds"
    }
    if (error.message?.includes("execution reverted")) {
      return "Transaction Failed"
    }
    return "Resource Creation Failed"
  }

  const getErrorDescription = () => {
    if (error.message?.includes("User rejected") || error.code === 4001) {
      return "You cancelled the transaction in your wallet."
    }
    if (error.message?.includes("insufficient funds")) {
      return "You don't have enough ETH to complete this transaction. Please add more ETH to your wallet and try again."
    }
    if (error.message?.includes("execution reverted")) {
      return "The smart contract rejected this transaction. This could be due to invalid parameters or contract restrictions."
    }
    return "An unexpected error occurred while creating the resource."
  }

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-md" variant="glass" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-redwood flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Error Creating Resource
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            There was an error while creating your resource. Please review the details below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error Details Card */}
          <Card variant="default">
            <CardHeader>
              <div className="flex items-center gap-2">
               
                <div>
                  <h3 className="text-lg font-semibold text-redwood">{getErrorTitle()}</h3>
                  <p className="text-sm text-mint-green mt-1">
                    {getErrorDescription()}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {error.message}
                </AlertDescription>
              </Alert>

              {/* Additional Error Details */}
              {(error.reason || error.code) && (
                <div className="space-y-2 mt-4">
                  {error.reason && (
                    <div className="text-sm">
                      <span className="font-medium text-mint-green">Reason:</span>
                      <div className="text-mint-green mt-1 break-words">
                        {error.reason}
                      </div>
                    </div>
                  )}

                  {error.code && (
                    <div className="text-sm">
                      <span className="font-medium text-mint-green">Error Code:</span>
                      <div className="text-mint-green mt-1">
                        {error.code}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transaction Hash (if available) */}
          {error.txHash && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Failed Transaction</div>
                  <div className="text-sm text-muted-foreground">
                    Hash: {error.txHash.slice(0, 10)}...{error.txHash.slice(-8)}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleViewOnEtherscan}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Etherscan
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={onClose} className="flex-1">
              Try Again
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
