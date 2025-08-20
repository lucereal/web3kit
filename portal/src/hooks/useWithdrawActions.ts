"use client"
import { useMemo } from "react"
import { useAccount } from "wagmi"
import { useSellerBalance } from "./useContract"
import { useNetworkGuard } from "./useNetworkGuard"
import { useContractWrites } from "./useContractWrites"
import { formatWeiToEth } from "@/utils/blockchain"

export interface WithdrawButtonState {
  type: 'connect' | 'switch' | 'no-balance' | 'withdrawing' | 'withdraw'
  disabled: boolean
  action?: () => void | Promise<void>
  loading?: boolean
  text: string
  balance: string
  hasBalance: boolean
}

export function useWithdrawActions() {
  const { address, isConnected } = useAccount()
  const { data: balance, refetch: refetchBalance } = useSellerBalance(address)
  const { wrong: wrongNetwork, onSwitch, isPending: switchPending } = useNetworkGuard()
  const { withdrawEarnings, isPending: withdrawPending } = useContractWrites()

  const balanceEth = balance ? formatWeiToEth(balance as bigint) : "0"
  const hasBalance = balance && (balance as bigint) > BigInt(0)

  const handleWithdraw = async () => {
    try {
      await withdrawEarnings()
      // Refetch balance after successful withdrawal
      setTimeout(() => {
        refetchBalance()
      }, 2000)
    } catch (error) {
      console.error('Withdraw failed:', error)
      // Error handling is done in the component via toast
    }
  }

  const buttonState: WithdrawButtonState = useMemo(() => {
    if (!isConnected) {
      return {
        type: 'connect',
        disabled: true,
        text: 'Connect Wallet',
        balance: balanceEth,
        hasBalance: false
      }
    }

    if (wrongNetwork) {
      return {
        type: 'switch',
        disabled: switchPending,
        loading: switchPending,
        action: onSwitch,
        text: switchPending ? 'Switching...' : 'Switch Network',
        balance: balanceEth,
        hasBalance: false
      }
    }

    if (!hasBalance) {
      return {
        type: 'no-balance',
        disabled: true,
        text: 'No Earnings',
        balance: balanceEth,
        hasBalance: false
      }
    }

    if (withdrawPending) {
      return {
        type: 'withdrawing',
        disabled: true,
        loading: true,
        text: 'Withdrawing...',
        balance: balanceEth,
        hasBalance: true
      }
    }

    return {
      type: 'withdraw',
      disabled: false,
      action: handleWithdraw,
      text: `Withdraw ${balanceEth} ETH`,
      balance: balanceEth,
      hasBalance: true
    }
  }, [isConnected, wrongNetwork, hasBalance, withdrawPending, balanceEth, switchPending, onSwitch])

  return {
    buttonState,
    handleAction: buttonState.action,
    isPending: withdrawPending,
    balance: balanceEth,
    hasBalance
  }
}
