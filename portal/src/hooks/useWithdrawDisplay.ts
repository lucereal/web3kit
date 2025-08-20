"use client"
import { useMemo } from "react"
import { useAccount } from "wagmi"
import { useSellerBalance } from "./useContract"
import { formatWeiToEth, formatWeiToEthSimple } from "@/utils/blockchain"

export function useWithdrawDisplay() {
  const { address, isConnected } = useAccount()
  const { data: balance, isLoading } = useSellerBalance(address)

  const displayData = useMemo(() => {
    if (!balance) {
      return {
        balance: "0",
        balanceFormatted: "0 ETH",
        balanceSimple: "0.0000 ETH",
        hasBalance: false,
        canWithdraw: false
      }
    }

    const balanceWei = balance as bigint
    const hasBalance = balanceWei > BigInt(0)

    return {
      balance: balanceWei.toString(),
      balanceFormatted: `${formatWeiToEth(balanceWei)} ETH`,
      balanceSimple: formatWeiToEthSimple(balanceWei, 4),
      hasBalance,
      canWithdraw: isConnected && hasBalance
    }
  }, [balance, isConnected])

  return {
    ...displayData,
    isLoading,
    isConnected,
    address
  }
}
