"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAccount } from "wagmi"
import { useSellerBalance } from "@/hooks/useContract"
import { useNetworkGuard } from "@/hooks/useNetworkGuard"
import { withdrawEarnings, formatWeiToEth } from "@/lib/contract-writes"
import { toast } from "sonner"
import { Loader2, Wallet } from "lucide-react"

export function WithdrawButton() {
  const { address, isConnected } = useAccount()
  const { data: balance, refetch } = useSellerBalance(address)
  const { wrong: wrongNetwork, onSwitch, isPending: switchPending } = useNetworkGuard()
  const [withdrawing, setWithdrawing] = useState(false)

  const balanceEth = balance ? formatWeiToEth(balance as bigint) : "0"
  const hasBalance = balance && (balance as bigint) > BigInt(0)

  const handleWithdraw = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet")
      return
    }

    if (wrongNetwork) {
      toast.error("Please switch to Sepolia network")
      return
    }

    if (!hasBalance) {
      toast.error("No earnings to withdraw")
      return
    }

    setWithdrawing(true)
    try {
      const { hash } = await withdrawEarnings()
      toast.success("Withdrawal successful!", {
        description: `Transaction: ${hash.slice(0, 10)}...`,
        action: {
          label: "View on Etherscan",
          onClick: () => window.open(`https://sepolia.etherscan.io/tx/${hash}`, '_blank')
        }
      })
      // Refetch balance
      refetch()
    } catch (error: any) {
      console.error("Withdraw error:", error)
      if (error.message?.includes("User rejected")) {
        toast.error("Transaction cancelled")
      } else {
        toast.error("Withdrawal failed", {
          description: error.message || "Unknown error occurred"
        })
      }
    } finally {
      setWithdrawing(false)
    }
  }

  if (!isConnected) {
    return (
      <Button size="sm" variant="outline" disabled>
        <Wallet className="w-4 h-4 mr-2" />
        Connect Wallet
      </Button>
    )
  }

  if (wrongNetwork) {
    return (
      <Button 
        size="sm" 
        variant="outline" 
        onClick={onSwitch}
        disabled={switchPending}
      >
        {switchPending ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          "Switch Network"
        )}
      </Button>
    )
  }

  return (
    <Button
      size="sm"
      variant={hasBalance ? "default" : "outline"}
      onClick={handleWithdraw}
      disabled={!hasBalance || withdrawing}
    >
      {withdrawing ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Wallet className="w-4 h-4 mr-2" />
      )}
      {withdrawing ? "Withdrawing..." : `Withdraw ${balanceEth} ETH`}
    </Button>
  )
}
