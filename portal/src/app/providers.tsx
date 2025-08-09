"use client"
import { ReactNode, useMemo } from "react"
import { WagmiProvider } from "wagmi"
import { sepolia } from "wagmi/chains"
import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit"
import "@rainbow-me/rainbowkit/styles.css"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "next-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const wcProjectId = process.env.NEXT_PUBLIC_WC_ID || "example"

const wagmiConfig = getDefaultConfig({
  appName: "Web3Kit",
  projectId: wcProjectId,
  chains: [sepolia],
  ssr: true,
})

const queryClient = new QueryClient()

export default function Providers({ children }: { children: ReactNode }) {
  const theme = useMemo(() => darkTheme({ accentColor: "#FF4FA1" }), [])
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="dark" 
      enableSystem={false}
      disableTransitionOnChange
      forcedTheme="dark"
    >
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={theme}>
            {children}
            <Toaster />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  )
}
