"use client"
import Link from "next/link"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Separator } from "@/components/ui/separator"
import { NetworkGuard } from "./network-guard"
import { TxDrawer } from "./tx-drawer"
import { Orbit } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
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
            <span className="rounded-full px-2 py-1 text-xs bg-card border border-border">Sepolia</span>
            <ConnectButton />
          </div>
        </div>
        <NetworkGuard />
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <TxDrawer />
    </div>
  )
}
