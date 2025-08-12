// Re-export types from the contract decoder package
export type { Resource, Access } from '@san-dev/access-contract-decoder'
export { ResourceType } from '@san-dev/access-contract-decoder'

// UI-specific resource type for display
export interface UIResource {
  id: number
  name: string
  description: string
  price: string // formatted ETH string
  seller: string
  hasAccess?: boolean
  resourceType: 'URL' | 'IPFS'
  createdAt: string
  isActive: boolean
}
