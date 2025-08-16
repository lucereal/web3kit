"use client"
import { ReactNode, useMemo } from "react"
import { WagmiProvider } from "wagmi"
import { sepolia } from "wagmi/chains"
import {
  RainbowKitProvider,
  lightTheme,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit"
import "@rainbow-me/rainbowkit/styles.css"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "next-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const wcProjectId = process.env.NEXT_PUBLIC_WC_ID || "example"

// Create config outside component to prevent re-initialization - use let to ensure singleton
let wagmiConfigInstance: ReturnType<typeof getDefaultConfig> | undefined

const getWagmiConfig = () => {
  if (!wagmiConfigInstance) {
    wagmiConfigInstance = getDefaultConfig({
      appName: "Web3Kit",
      projectId: wcProjectId,
      chains: [sepolia],
      ssr: true,
    })
  }
  return wagmiConfigInstance
}

const wagmiConfig = getWagmiConfig()

// Export config for use in contract writes
export { wagmiConfig as config }

// Create QueryClient outside component to prevent re-initialization - use singleton
let queryClientInstance: QueryClient | undefined

const getQueryClient = () => {
  if (!queryClientInstance) {
    queryClientInstance = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60, // 1 minute
        },
      },
    })
  }
  return queryClientInstance
}

const queryClient = getQueryClient()

export default function Providers({ children }: { children: ReactNode }) {
  const theme = useMemo(() => lightTheme({ accentColor: "var(--purple-primary)" }), [])
  
  return (

      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={theme}>
            {children}
            <Toaster />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>

  )
}
