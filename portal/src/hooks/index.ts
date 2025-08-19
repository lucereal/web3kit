// Centralized hook exports for easier imports

// Authentication hooks (NEW)
export { useAuth, AuthProvider } from '@/contexts/AuthContext'
export { useWalletAuth } from './useWalletAuth'
export { useBackendApi, useUserApi } from './useBackendApi'

// Contract interaction hooks (NEW)
export { useContractWrites, parseEthToWei, formatWeiToEth } from '@/lib/contract-writes'

// Contract hooks
export { useResources, useResource, useHasAccess, useSellerBalance, useNextResourceId } from './useContract'

// Network and transaction hooks
export { useNetworkGuard } from './useNetworkGuard'

// Custom resource hooks
export { useResourceActions, type ButtonState } from './useResourceActions'
export { useResourceDisplay } from './useResourceDisplay'

// Page state hooks
export { usePageState, type PageState } from './usePageState'

// Types
export type { ApiCallOptions } from './useBackendApi'
export type { CreateResourceInput } from '@/lib/contract-writes'

// This allows for cleaner imports:
// import { useAuth, useBackendApi, useContractWrites } from '@/hooks'
// import { useResources, useResourceActions, usePageState } from '@/hooks'
// Instead of multiple import lines
