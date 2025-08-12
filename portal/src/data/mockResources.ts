export interface MockResource {
  id: string
  name: string
  description: string
  priceEth: string
  seller: string
  createdAt: string
  category: string
  isActive: boolean
}

export const mockResources: MockResource[] = [
  {
    id: "1",
    name: "Premium API Access",
    description: "High-performance trading API with real-time market data and advanced analytics",
    priceEth: "0.05",
    seller: "0x742d35Cc6A5e5C8e8B5",
    createdAt: "2025-08-01T10:00:00Z",
    category: "API",
    isActive: true
  },
  {
    id: "2", 
    name: "NFT Metadata Service",
    description: "Decentralized IPFS hosting for NFT metadata with 99.9% uptime guarantee",
    priceEth: "0.02",
    seller: "0x8ba1f109551bD432803",
    createdAt: "2025-08-02T14:30:00Z",
    category: "Storage",
    isActive: true
  },
  {
    id: "3",
    name: "Smart Contract Audit",
    description: "Professional security audit for your smart contracts by certified experts",
    priceEth: "0.1",
    seller: "0x39c6b5e0c1ad6a0b8e2",
    createdAt: "2025-08-03T09:15:00Z",
    category: "Security",
    isActive: true
  },
  {
    id: "4",
    name: "DeFi Analytics Dashboard",
    description: "Real-time portfolio tracking and yield farming optimization tools",
    priceEth: "0.03",
    seller: "0x1f2e3d4c5b6a7890abc",
    createdAt: "2025-08-04T16:45:00Z",
    category: "Analytics",
    isActive: true
  },
  {
    id: "5",
    name: "Web3 Education Course",
    description: "Complete blockchain development bootcamp with hands-on projects",
    priceEth: "0.08",
    seller: "0x742d35Cc6A5e5C8e8B5",
    createdAt: "2025-08-05T11:20:00Z",
    category: "Education",
    isActive: false
  },
  {
    id: "6",
    name: "DAO Governance Tools",
    description: "Streamlined voting and proposal management for decentralized organizations",
    priceEth: "0.06",
    seller: "0x8ba1f109551bD432803",
    createdAt: "2025-08-06T13:10:00Z",
    category: "Governance",
    isActive: true
  }
]
