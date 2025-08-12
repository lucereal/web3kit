import { sepolia } from 'wagmi/chains'
import { ABI, ResourceType, GAS_LIMITS } from '@san-dev/access-contract-decoder'

export const ACCESS_ADDRESS = '0x8423064df5BF3AeB77bECcB9e1424bA5dADAa179' as const
export const ACCESS_CHAIN = sepolia
export const ACCESS_ABI = ABI

// Re-export useful constants from the package
export { ResourceType, GAS_LIMITS }

export const FN = {
  create: 'createResource',
  buy: 'buyAccess',
  withdraw: 'withdraw',
  getAll: 'getAllResources',
  getOne: 'getResource',
  hasAccess: 'hasAccess',
  sellerBal: 'sellerBalances',
} as const
