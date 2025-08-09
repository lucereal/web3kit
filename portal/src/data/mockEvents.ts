export interface MockEvent {
  id: string
  type: 'purchase' | 'listing' | 'withdrawal' | 'transfer'
  actor: string
  resource?: string
  resourceName?: string
  amount?: string
  timestamp: string
  txHash: string
  blockNumber: number
}

export const mockEvents: MockEvent[] = [
  {
    id: "1",
    type: "purchase",
    actor: "0x1a2b3c4d5e6f7890abc",
    resource: "1",
    resourceName: "Premium API Access",
    amount: "0.05",
    timestamp: "2025-08-08T15:30:00Z",
    txHash: "0x9f8e7d6c5b4a39281507bcde123456789abcdef",
    blockNumber: 18500123
  },
  {
    id: "2",
    type: "listing",
    actor: "0x742d35Cc6A5e5C8e8B5",
    resource: "6",
    resourceName: "DAO Governance Tools",
    amount: "0.06",
    timestamp: "2025-08-08T14:15:00Z",
    txHash: "0x8e7d6c5b4a3928150bcde123456789abcdef9f",
    blockNumber: 18500098
  },
  {
    id: "3",
    type: "purchase",
    actor: "0x39c6b5e0c1ad6a0b8e2",
    resource: "2",
    resourceName: "NFT Metadata Service",
    amount: "0.02",
    timestamp: "2025-08-08T13:45:00Z",
    txHash: "0x7d6c5b4a3928150bcde123456789abcdef9f8e",
    blockNumber: 18500067
  },
  {
    id: "4",
    type: "withdrawal",
    actor: "0x8ba1f109551bD432803",
    amount: "0.08",
    timestamp: "2025-08-08T12:20:00Z",
    txHash: "0x6c5b4a3928150bcde123456789abcdef9f8e7d",
    blockNumber: 18500034
  },
  {
    id: "5",
    type: "purchase",
    actor: "0x1f2e3d4c5b6a7890abc",
    resource: "3",
    resourceName: "Smart Contract Audit",
    amount: "0.1",
    timestamp: "2025-08-08T11:10:00Z",
    txHash: "0x5b4a3928150bcde123456789abcdef9f8e7d6c",
    blockNumber: 18500001
  },
  {
    id: "6",
    type: "listing",
    actor: "0x39c6b5e0c1ad6a0b8e2",
    resource: "4",
    resourceName: "DeFi Analytics Dashboard", 
    amount: "0.03",
    timestamp: "2025-08-08T10:00:00Z",
    txHash: "0x4a3928150bcde123456789abcdef9f8e7d6c5b",
    blockNumber: 18499978
  }
]
