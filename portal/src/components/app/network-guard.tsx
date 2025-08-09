"use client"
import { useChainId } from "wagmi"
import { sepolia } from "wagmi/chains"
import { useChainModal } from "@rainbow-me/rainbowkit"

export function NetworkGuard() {
  const chainId = useChainId()
  const { openChainModal } = useChainModal()
  if (!chainId) return null
  if (chainId === sepolia.id) return null
  return (
    <div className="w-full bg-amber-500/10 text-amber-200 border-b border-amber-500/30">
      <div className="mx-auto max-w-6xl px-4 py-2 text-sm flex items-center gap-3">
        <span>Wrong network detected. Please switch to Sepolia.</span>
        <button
          onClick={() => openChainModal?.()}
          className="ml-auto px-3 py-1 rounded-lg bg-amber-400 text-black"
        >
          Switch Network
        </button>
      </div>
    </div>
  )
}
