// Centralized hook exports for easier imports

// Contract hooks
export { useResources, useResource, useHasAccess, useSellerBalance, useNextResourceId } from './useContract'

// Network and transaction hooks
export { useNetworkGuard } from './useNetworkGuard'

// Custom resource hooks
export { useResourceActions, type ButtonState } from './useResourceActions'
export { useResourceDisplay } from './useResourceDisplay'

// Page state hooks
export { usePageState, type PageState } from './usePageState'

// This allows for cleaner imports:
// import { useResources, useResourceActions, usePageState } from '@/hooks'
// Instead of multiple import lines
