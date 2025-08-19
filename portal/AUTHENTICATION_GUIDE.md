# Web3 Authentication System - Usage Guide

## 🎯 **System Overview**

Your Web3 authentication system now includes:

✅ **JWT + Wallet hybrid authentication**  
✅ **Automatic wallet connection checks**  
✅ **Type-safe backend API calls**  
✅ **Unified contract interactions**  
✅ **Error handling & loading states**  

---

## 🚀 **Quick Start**

### 1. Basic Authentication Flow
```tsx
import { useAuth, useBackendApi, useContractWrites } from '@/hooks'

function MyComponent() {
  const { isAuthenticated, authenticate } = useAuth()
  const { get, post } = useBackendApi()
  const { createResource, buyResource } = useContractWrites()

  // Authenticate user
  const handleAuth = async () => {
    const success = await authenticate()
    if (success) console.log('✅ Authenticated!')
  }

  // Make authenticated API call
  const fetchUserData = async () => {
    const data = await get('/api/user/profile')
    console.log('User data:', data)
  }

  // Interact with smart contract
  const createNewResource = async () => {
    await createResource({
      name: 'My Resource',
      price: parseEthToWei('0.001'),
      // ... other params
    })
  }

  return (
    <div>
      <button onClick={handleAuth}>Authenticate</button>
      <button onClick={fetchUserData}>Get User Data</button>
      <button onClick={createNewResource}>Create Resource</button>
    </div>
  )
}
```

### 2. Using the Complete Example Component
```tsx
import { CompleteWeb3Example } from '@/components/CompleteWeb3Example'

function App() {
  return (
    <main>
      <CompleteWeb3Example />
    </main>
  )
}
```

### 3. Using the Authentication Status Component
```tsx
import { AuthStatus } from '@/components/AuthStatus'

function Sidebar() {
  return (
    <aside>
      <AuthStatus />
    </aside>
  )
}
```

---

## 📚 **Available Hooks**

### `useAuth()`
```tsx
const {
  isAuthenticated,    // boolean - has JWT token
  jwt,               // string | null - actual JWT
  authenticate,      // () => Promise<boolean> - sign & get JWT
  logout,           // () => void - clear JWT
  isLoading,        // boolean - authentication in progress
  error,            // string | null - auth error
  getAuthHeaders,   // () => {Authorization?: string}
  canAccessBackend  // boolean - can make API calls
} = useAuth()
```

### `useBackendApi()`
```tsx
const {
  get,              // <T>(url, options?) => Promise<T>
  post,             // <T>(url, data?, options?) => Promise<T>
  put,              // <T>(url, data?, options?) => Promise<T>
  delete,           // <T>(url, options?) => Promise<T>
  patch,            // <T>(url, data?, options?) => Promise<T>
  apiCall,          // Generic API call function
  isLoading,        // boolean - API call in progress
  error,            // string | null - API error
  clearError        // () => void - clear error
} = useBackendApi()
```

### `useUserApi()`
```tsx
const {
  getUserResources,  // (address: string) => Promise<Resource[]>
  getUserPurchases,  // (address: string) => Promise<Purchase[]>
  getUserProfile,    // (address: string) => Promise<Profile>
  ...backendApiMethods // All useBackendApi methods
} = useUserApi()
```

### `useContractWrites()`
```tsx
const {
  createResource,    // (input: CreateResourceInput) => Promise<void>
  buyResource,       // (id: bigint, price: bigint) => Promise<void>
  withdrawEarnings,  // () => Promise<void>
  isPending,         // boolean - transaction in progress
  isSuccess,         // boolean - transaction succeeded
  error,            // string | null - transaction error
  hash,             // string | undefined - transaction hash
  isWalletConnected // boolean - wallet connection status
} = useContractWrites()
```

### `useWalletAuth()`
```tsx
const {
  authenticate,      // () => Promise<string> - returns JWT token
  isAuthenticating, // boolean - signing in progress
  isWalletConnected,// boolean - wallet connected
  walletAddress,    // string | undefined - wallet address
  error,            // string | null - auth error
  clearError        // () => void - clear error
} = useWalletAuth()
```

---

## 🔧 **Utility Functions**

```tsx
import { parseEthToWei, formatWeiToEth } from '@/hooks'

// Convert ETH string to Wei bigint
const priceInWei = parseEthToWei('0.001') // 0.001 ETH → 1000000000000000n

// Convert Wei bigint to ETH string  
const ethAmount = formatWeiToEth(1000000000000000n) // → "0.001"
```

---

## 🏗️ **Architecture Flow**

```
1. User connects wallet → useAccount() from wagmi
2. User signs message → useWalletAuth().authenticate()
3. Backend verifies signature → JWT stored in localStorage
4. API calls use JWT → useBackendApi() auto-includes token
5. Contract calls use wallet → useContractWrites() auto-checks connection
```

---

## 🔐 **Security Features**

✅ **JWT expires in 24 hours**  
✅ **Nonce prevents replay attacks**  
✅ **Automatic cleanup of expired nonces**  
✅ **CORS-enabled API endpoints**  
✅ **Error handling for failed signatures**  

---

## 📁 **File Structure**

```
src/
├── contexts/
│   └── AuthContext.tsx         # JWT + wallet state management
├── hooks/
│   ├── useWalletAuth.ts       # Wallet signing logic
│   ├── useBackendApi.ts       # Authenticated API calls
│   └── index.ts               # Centralized exports
├── lib/
│   └── contract-writes.ts     # Smart contract interactions
├── components/
│   ├── AuthStatus.tsx         # Authentication UI component
│   └── CompleteWeb3Example.tsx # Full demo component
└── app/
    └── providers.tsx          # Wraps app with AuthProvider
```

---

## 🚨 **Common Patterns**

### Check Authentication Before Action
```tsx
const { isAuthenticated } = useAuth()

if (!isAuthenticated) {
  // Show login prompt
  return <LoginPrompt />
}

// Show authenticated content
return <AuthenticatedContent />
```

### Handle API Errors
```tsx
const { get, error } = useBackendApi()

const fetchData = async () => {
  try {
    const result = await get('/api/data')
    // Handle success
  } catch (err) {
    // Error already stored in `error` state
    console.error('API failed:', error)
  }
}
```

### Contract + Backend Sync
```tsx
const { createResource } = useContractWrites()
const { post } = useBackendApi()

const handleCreate = async (resourceData) => {
  // 1. Create on blockchain
  await createResource(resourceData)
  
  // 2. Store metadata in backend
  await post('/api/resources', {
    ...resourceData,
    onChain: true
  })
}
```

---

Your Web3 authentication system is now **production-ready**! 🎉
