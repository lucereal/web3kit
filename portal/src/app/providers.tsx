"use client"
import { ReactNode, useMemo } from "react"
import { WagmiProvider, createConfig, http } from "wagmi"
import { sepolia } from "wagmi/chains"
import {
  RainbowKitProvider,
  lightTheme,
  getDefaultWallets,
  darkTheme,
} from "@rainbow-me/rainbowkit"
import "@rainbow-me/rainbowkit/styles.css"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "next-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "@/contexts/AuthContext"

const wcProjectId = process.env.NEXT_PUBLIC_WC_ID || "example"

// Use a premium RPC provider for better rate limits
const getRpcUrl = () => {
  // Priority order: Alchemy > Infura > Public
  if (process.env.NEXT_PUBLIC_ALCHEMY_URL) {
    return process.env.NEXT_PUBLIC_ALCHEMY_URL
  }
  if (process.env.NEXT_PUBLIC_INFURA_URL) {
    return process.env.NEXT_PUBLIC_INFURA_URL
  }
  // Fallback to public (rate limited)
  return sepolia.rpcUrls.default.http[0]
}

// Create config with custom RPC transport - moved inside component to ensure client-side only
let wagmiConfigInstance: ReturnType<typeof createConfig> | undefined

const getWagmiConfig = () => {
  if (typeof window === 'undefined') {
    // Return a minimal config for SSR
    return createConfig({
      chains: [sepolia],
      connectors: [],
      transports: {
        [sepolia.id]: http(sepolia.rpcUrls.default.http[0]),
      },
      ssr: true,
    })
  }

  if (!wagmiConfigInstance) {
    const { connectors } = getDefaultWallets({
      appName: "Web3Kit",
      projectId: wcProjectId,
    })
    
    wagmiConfigInstance = createConfig({
      chains: [sepolia],
      connectors,
      transports: {
        [sepolia.id]: http(getRpcUrl(), {
          // Configure batch requests for better performance
          batch: true,
          fetchOptions: {
            // Standard fetch options only
          },
        }),
      },
      ssr: true,
    })
  }
  return wagmiConfigInstance
}

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
  const theme = useMemo(() => darkTheme({ accentColor: "var(--purple-primary)" }), [])
  
  // Create wagmi config in component to ensure client-side initialization
  const wagmiConfig = useMemo(() => getWagmiConfig(), [])
  
  return (
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={theme}>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
  )
}

// Export config for use in contract writes - but make it safe for SSR
export const config = typeof window !== 'undefined' ? getWagmiConfig() : null
