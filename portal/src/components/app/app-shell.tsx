"use client"
import Link from "next/link"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { createContext, useContext, useState } from "react"

import { NetworkGuard } from "./network-guard"
import { TxDrawer } from "./tx-drawer"
import { Orbit } from 'lucide-react';

// Create Debug Context
const DebugContext = createContext<{
  showDebugPanel: boolean
  setShowDebugPanel: (show: boolean) => void
}>({
  showDebugPanel: false,
  setShowDebugPanel: () => {}
})

export const useDebugPanel = () => useContext(DebugContext)

export function AppShell({ children }: { children: React.ReactNode }) {
  const [showDebugPanel, setShowDebugPanel] = useState(false)
  
  return (
    <DebugContext.Provider value={{ showDebugPanel, setShowDebugPanel }}>
      <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-40 backdrop-blur bg-background/70 border-b border-border">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center gap-4">
          <Link href="/" className="flex items-center space-x-2 text-xl font-bold">
            <Orbit className="h-8 w-8 gradient-icon" />
          <span className="gradient-primary bg-clip-text text-transparent">
            Web3Kit
          </span>
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <nav className="hidden md:flex items-center gap-3 text-sm text-muted-foreground">
            <Link href="/">Explore</Link>
            <Link href="/activity">Activity</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/create">Create</Link>
             
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Label className="text-sm font-medium">Debug Panel</Label>
              <Switch
                checked={showDebugPanel}
                onCheckedChange={setShowDebugPanel}
              />
            <span className="rounded-full px-2 py-1 text-xs bg-card border border-border">Sepolia</span>
            <ConnectButton />
          </div>
        </div>
        <NetworkGuard />
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <TxDrawer />
    </div>
    </DebugContext.Provider>
  )
}
