import { sepolia } from 'wagmi/chains'

// Direct ABI instead of package import to debug
export const ACCESS_ADDRESS = '0x8423064df5BF3AeB77bECcB9e1424bA5dADAa179' as const
export const ACCESS_CHAIN = sepolia

// Minimal ABI for testing - just the functions we need
export const ACCESS_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "string", "name": "cid", "type": "string" },
      { "internalType": "string", "name": "url", "type": "string" },
      { "internalType": "string", "name": "serviceId", "type": "string" },
      { "internalType": "uint256", "name": "price", "type": "uint256" },
      { "internalType": "uint8", "name": "resourceType", "type": "uint8" }
    ],
    "name": "createResource",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllResources",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "owner", "type": "address" },
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "description", "type": "string" },
          { "internalType": "string", "name": "cid", "type": "string" },
          { "internalType": "string", "name": "url", "type": "string" },
          { "internalType": "string", "name": "serviceId", "type": "string" },
          { "internalType": "uint256", "name": "price", "type": "uint256" },
          { "internalType": "bool", "name": "isActive", "type": "bool" },
          { "internalType": "uint8", "name": "resourceType", "type": "uint8" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" }
        ],
        "internalType": "struct AccessContract.Resource[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "resourceId", "type": "uint256" }
    ],
    "name": "buyAccess",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "uint256", "name": "resourceId", "type": "uint256" }
    ],
    "name": "hasAccess",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "sellerBalances",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

export const FN = {
  create: 'createResource',
  buy: 'buyAccess',
  withdraw: 'withdraw',
  getAll: 'getAllResources',
  getOne: 'getResource',
  hasAccess: 'hasAccess',
  sellerBal: 'sellerBalances',
} as const
