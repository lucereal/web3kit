Perfect—thanks for the ABI and the Sepolia address. Here’s exactly how I’d wire **PR #3** with wagmi/viem using your contract.

# Contract config (one place)

```ts
// /contracts/access.ts
import { sepolia } from 'wagmi/chains'
export const ACCESS_ADDRESS = '0x8423064df5BF3AeB77bECcB9e1424bA5dADAa179' as const
export const ACCESS_CHAIN = sepolia
export const ACCESS_ABI = [ /* paste your ABI JSON here */ ] as const

export const FN = {
  list: 'createResource',
  buy: 'buyAccess',
  withdraw: 'withdraw',
  getAll: 'getAllResources',
  getOne: 'getResource',
  hasAccess: 'hasAccess',
  sellerBal: 'sellerBalances',
} as const
```

# Types matching your struct

```ts
// /data/resource.ts
export type Resource = {
  owner: `0x${string}`
  name: string
  description: string
  cid: string
  url: string
  serviceId: string
  price: bigint
  isActive: boolean
  resourceType: number // enum uint8
  createdAt: bigint
}
```

# Reads (swap out mocks)

### Explore (list all resources)

```ts
import { useReadContract } from 'wagmi'
import { ACCESS_ADDRESS, ACCESS_ABI, FN } from '@/contracts/access'

export function useResources() {
  return useReadContract({
    address: ACCESS_ADDRESS,
    abi: ACCESS_ABI,
    functionName: FN.getAll, // getAllResources()
  })
}
```

### Resource detail

```ts
export function useResource(id: bigint) {
  return useReadContract({
    address: ACCESS_ADDRESS,
    abi: ACCESS_ABI,
    functionName: FN.getOne, // getResource(uint256)
    args: [id],
  })
}
```

### Has access & seller balance

```ts
import { useAccount, useReadContract } from 'wagmi'

export function useHasAccess(user: `0x${string}` | undefined, id: bigint) {
  return useReadContract({
    address: ACCESS_ADDRESS,
    abi: ACCESS_ABI,
    functionName: 'hasAccess',
    args: user ? [user, id] : undefined,
    query: { enabled: !!user },
  })
}

export function useSellerBalance(addr: `0x${string}` | undefined) {
  return useReadContract({
    address: ACCESS_ADDRESS,
    abi: ACCESS_ABI,
    functionName: 'sellerBalances',
    args: addr ? [addr] : undefined,
    query: { enabled: !!addr },
  })
}
```

# Writes (buy, create, withdraw) via simulate → write → wait

```ts
import { useAccount } from 'wagmi'
import { simulateContract, writeContract, waitForTransactionReceipt } from 'wagmi/actions'
import { ACCESS_ADDRESS, ACCESS_ABI, FN, ACCESS_CHAIN } from '@/contracts/access'

export async function buyResource(resourceId: bigint, priceWei: bigint) {
  const { request } = await simulateContract({
    address: ACCESS_ADDRESS,
    abi: ACCESS_ABI,
    functionName: FN.buy, // buyAccess(uint256) payable
    args: [resourceId],
    value: priceWei,
    chainId: ACCESS_CHAIN.id,
  })
  const hash = await writeContract(request)
  const receipt = await waitForTransactionReceipt({ hash, chainId: ACCESS_CHAIN.id })
  return receipt
}

export async function createResource(input: {
  name: string; description: string; cid: string; url: string; serviceId: string;
  price: bigint; resourceType: number;
}) {
  const { request } = await simulateContract({
    address: ACCESS_ADDRESS,
    abi: ACCESS_ABI,
    functionName: FN.list,
    args: [input.name, input.description, input.cid, input.url, input.serviceId, input.price, input.resourceType],
    chainId: ACCESS_CHAIN.id,
  })
  const hash = await writeContract(request)
  return waitForTransactionReceipt({ hash, chainId: ACCESS_CHAIN.id })
}

export async function withdrawEarnings() {
  const { request } = await simulateContract({
    address: ACCESS_ADDRESS,
    abi: ACCESS_ABI,
    functionName: FN.withdraw,
    chainId: ACCESS_CHAIN.id,
  })
  const hash = await writeContract(request)
  return waitForTransactionReceipt({ hash, chainId: ACCESS_CHAIN.id })
}
```

# Event watchers (live UI)

### Global or per-resource streams

```ts
import { watchContractEvent } from 'wagmi/actions'
import { ACCESS_ADDRESS, ACCESS_ABI } from '@/contracts/access'

export function watchGlobalEvents(onEvent: (e: any) => void) {
  return watchContractEvent({
    address: ACCESS_ADDRESS,
    abi: ACCESS_ABI,
    eventName: ['ResourceCreated','AccessPurchased','Withdrawal'],
    onLogs: (logs) => {
      logs.forEach((log) => onEvent({ ...log, k: `${log.transactionHash}:${log.logIndex}` }))
    },
  })
}

export function watchResourceEvents(resourceId: bigint, onEvent: (e:any)=>void) {
  return watchContractEvent({
    address: ACCESS_ADDRESS,
    abi: ACCESS_ABI,
    eventName: ['AccessPurchased','Withdrawal','ResourceCreated'],
    args: undefined, // no indexed resourceId in ResourceCreated, but buyer is indexed in AccessPurchased
    onLogs: (logs) => {
      // Filter AccessPurchased resourceId (not indexed → in data), decode via ABI (wagmi already decodes log.args)
      logs.forEach((log) => {
        const k = `${log.transactionHash}:${log.logIndex}`
        // AccessPurchased has args: resourceId, buyer (indexed), amountPaid, purchasedAt
        if (log.eventName === 'AccessPurchased' && log.args?.resourceId === resourceId) {
          onEvent({ ...log, k })
        }
        if (log.eventName === 'ResourceCreated' && log.args?.resourceId === resourceId) {
          onEvent({ ...log, k })
        }
        if (log.eventName === 'Withdrawal') {
          onEvent({ ...log, k })
        }
      })
    },
  })
}
```

> Dedupe tip: maintain a `Set<string>` of keys `txHash:logIndex` in your feed store.

# Wrong network guard (one-click switch)

```ts
import { useChainId, useSwitchChain } from 'wagmi'
import { sepolia } from 'wagmi/chains'

export function useNetworkGuard() {
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const onSwitch = () => switchChain({ chainId: sepolia.id })
  const wrong = chainId !== sepolia.id
  return { wrong, onSwitch }
}
```

# Minimal UI wiring examples

### Buy button

```tsx
import { useResource } from '@/hooks/resources'
import { buyResource } from '@/lib/tx-write'
import { useState } from 'react'

function BuyButton({ id }: { id: bigint }) {
  const { data: res } = useResource(id)
  const [busy, setBusy] = useState(false)

  const onBuy = async () => {
    if (!res) return
    setBusy(true)
    try {
      await buyResource(id, res.price as bigint)
      // open TxDrawer success, toast, refetch hooks
    } catch (e:any) {
      // show error (UserRejected vs revert reason)
    } finally {
      setBusy(false)
    }
  }

  return <button disabled={!res || busy} onClick={onBuy}>Buy</button>
}
```

### Withdraw button

```tsx
import { withdrawEarnings } from '@/lib/tx-write'
import { useSellerBalance } from '@/hooks/resources'
import { useAccount } from 'wagmi'

function WithdrawButton(){
  const { address } = useAccount()
  const { data: bal, refetch } = useSellerBalance(address)
  const disabled = !bal || bal === 0n

  return (
    <button disabled={disabled} onClick={async()=>{
      try { await withdrawEarnings(); refetch() } catch {}
    }}>
      Withdraw {bal ? `${Number(bal)/1e18} ETH` : ''}
    </button>
  )
}
```

# Historical events: client vs backend

* **Hybrid (recommended):**

  * Frontend: `watchContractEvent` for real-time.
  * Backend API: `GET /api/events?cursor=…` serving stored events (from your Alchemy webhook) for history/pagination.
  * In UI: merge the two, dedupe by `txHash:logIndex`.

# ENV you’ll want

```
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_CONTRACT_ADDRESS=0x8423064df5BF3AeB77bECcB9e1424bA5dADAa179
NEXT_PUBLIC_WC_ID=your_walletconnect_id
ALCHEMY_HTTP_URL=... (for any server-side pagination if you use it)
```

---

If you want, I can drop these into **PR #3** on `feature/ui-scaffold`:

* `/contracts/access.ts`
* hooks for reads (`useResources`, `useResource`, `useHasAccess`, `useSellerBalance`)
* write helpers (`buyResource`, `createResource`, `withdrawEarnings`)
* event watcher utilities
* wire buttons in the existing pages (keeping your Dev Helpers visible)

Say the word and I’ll prep the exact file diffs.
