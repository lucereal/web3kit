Got it. Here’s the plan for branch **feature/ui-scaffold**:

---

## Coding Plan – feature/ui-scaffold

**1) Init UI Kit & Theme**

* Install shadcn/ui components, TailwindCSS, lucide-react.
* Configure Tailwind theme with locked brand tokens (dark gray, pink, optional dark blue, success/warning/error).
* Set dark theme as default; `class` strategy; CSS vars under `:root`.

**2) Providers Setup**

* Create `Providers` component for Theme, Wagmi, RainbowKit, SWR/Query, Toaster.
* Default to Sepolia; add NetworkGuard for chain switching.

**3) Scaffold Pages with Mocks**

* `/` Explore: ResourceGrid with mock ResourceCards; filters.
* `/resource/[id]` Detail: header, DetailsPanel, mock activity feed.
* `/create` Create Resource: form (Zod + RHF), PreviewCard, simulate modal.
* `/dashboard` Dashboard: tabs (My Resources, Purchases, Earnings, Activity) with mock tables/lists.
* `/activity` Global Activity: EventFeed, filters, dev toggles.

**4) Shared Components**

* AppShell (nav, footer, toasts, TxDrawer, NetworkBadge, ConnectButton).
* DevHelpersPanel, RawLogsDrawer, TxSimulatorModal, ClipboardButton.
* AddressPill, PriceTag, EmptyState, ErrorState, Skeletons.

**5) Utilities**

* `useDevMode` for toggling dev helpers (keyboard `D`).
* `useEvents` for watching contract events (mock now, viem later).
* `useTx` for write calls (stubbed now, with TxDrawer integration).

**6) Accessibility & Responsiveness**

* WCAG AA+ contrast.
* Visible focus rings, keyboard navigation.
* Mobile bottom nav; responsive stacking; icon-only wallet control on small screens.

**7) Dev Helpers Integration**

* Per-page dev toggle + global panel.
* Show raw logs/topics, simulate tx, copy curl examples, copy tx links.

---

**Deliverable for PR:**

* Fully navigable UI with mock data & placeholder logic.
* All major states represented (disconnected, wrong network, pending, confirmed, error).
* Ready to swap in live wagmi/viem hooks and backend API calls.

---

**Next:**
I’ll start building this branch with the above scaffold so you can click through the full app before wiring the contract logic.

---

## Implementation – PR #1 plan (`feature/ui-scaffold`)

> Goal: land the visual system, providers, routing shell, and mocked UI states. No contract calls yet.

### Branch & deps

```bash
# from repo root
git checkout -b feature/ui-scaffold

# deps
pnpm add next@latest react@latest react-dom@latest
pnpm add tailwindcss postcss autoprefixer class-variance-authority tailwind-merge clsx
pnpm add lucide-react
pnpm add zustand zod react-hook-form
pnpm add wagmi viem
pnpm add @rainbow-me/rainbowkit

# shadcn (if not initialized)
pnpm dlx shadcn@latest init -y
```

### Add shadcn components

```bash
pnpm dlx shadcn@latest add button input textarea select checkbox switch label
pnpm dlx shadcn@latest add dialog drawer toast tooltip alert progress
pnpm dlx shadcn@latest add card tabs table badge avatar separator skeleton
pnpm dlx shadcn@latest add dropdown-menu popover command accordion scroll-area navigation-menu sheet hover-card
```

### Tailwind setup

**`tailwind.config.ts`** (extend tokens)

```ts
import type { Config } from 'tailwindcss'
const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './content/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0F1014',
          surface: '#171821',
          surface2: '#1E2030',
          line: '#2A2E3F',
          text: '#E7E9EE',
          muted: '#A4A8B3',
          pink: '#FF4FA1',
          pinkHover: '#FF6AB1',
          blue: '#3A56FF',
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
        },
      },
      borderRadius: { xl: '1rem', '2xl': '1.25rem' },
      boxShadow: {
        card: '0 0 0 1px rgba(42,46,63,.9), 0 6px 20px rgba(0,0,0,.25)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
```

**`app/globals.css`** (dark theme baseline)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: dark; }
html, body { background: theme(colors.brand.bg); color: theme(colors.brand.text); }

/* focus ring */
:where(button, a, input, [role='button']):focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px theme(colors.brand.pink), 0 0 0 4px theme(colors.brand.surface);
}
```

### Providers

**`app/providers.tsx`**

```tsx
'use client'
import { ReactNode, useMemo } from 'react'
import { WagmiConfig, createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { RainbowKitProvider, darkTheme, getDefaultConfig } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { Toaster } from '@/components/ui/toast'

const wcProjectId = process.env.NEXT_PUBLIC_WC_ID || 'example'

const wagmiConfig = createConfig(
  getDefaultConfig({
    appName: 'Web3Kit',
    projectId: wcProjectId,
    chains: [sepolia],
    transports: { [sepolia.id]: http() },
    ssr: true,
  }) as any
)

export default function Providers({ children }: { children: ReactNode }) {
  const theme = useMemo(() => darkTheme({ accentColor: '#FF4FA1' }), [])
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider theme={theme}>
        {children}
        <Toaster />
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
```

### App layout & shell

**`app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'
import { AppShell } from '@/components/app/app-shell'

export const metadata: Metadata = { title: 'Web3Kit', description: 'Starter web3 app' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  )
}
```

**`components/app/app-shell.tsx`** (nav + network guard + tx drawer placeholder)

```tsx
'use client'
import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Separator } from '@/components/ui/separator'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-brand-bg text-brand-text">
      <header className="sticky top-0 z-40 backdrop-blur bg-brand-bg/70 border-b border-brand-line">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center gap-4">
          <Link href="/" className="font-semibold">Web3Kit</Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/">Explore</Link>
            <Link href="/create">Create</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/activity">Activity</Link>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="rounded-full px-2 py-1 text-xs bg-brand-surface border border-brand-line">Sepolia</span>
            <ConnectButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        {children}
      </main>
    </div>
  )
}
```

### MVP pages (shells with placeholders)

**`app/page.tsx`** (Explore)

```tsx
export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Explore</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* TODO: ResourceCard list (mocked) */}
        <div className="h-40 rounded-2xl bg-brand-surface border border-brand-line flex items-center justify-center text-brand-muted">ResourceCard</div>
      </div>
    </div>
  )
}
```

**`app/resource/[id]/page.tsx`** (Detail)

```tsx
export default function Page() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Resource Title</h1>
        <button className="px-4 py-2 rounded-xl bg-brand-pink text-black">Buy</button>
      </div>
      {/* TODO: Details & Activity feed */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-brand-surface border border-brand-line h-48" />
        <div className="rounded-2xl bg-brand-surface border border-brand-line h-48" />
      </div>
    </div>
  )
}
```

**`app/(creator)/create/page.tsx`** (Create)

```tsx
export default function Page() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <form className="space-y-4">
        {/* TODO: RHF + Zod */}
        <input className="w-full rounded-lg bg-brand-surface border border-brand-line px-3 py-2" placeholder="Name" />
        <textarea className="w-full rounded-lg bg-brand-surface border border-brand-line px-3 py-2" placeholder="Description" />
        <div className="flex gap-3">
          <input className="flex-1 rounded-lg bg-brand-surface border border-brand-line px-3 py-2" placeholder="Price (ETH)" />
          <input className="flex-1 rounded-lg bg-brand-surface border border-brand-line px-3 py-2" placeholder="External URL (opt)" />
        </div>
        <button className="px-4 py-2 rounded-xl bg-brand-pink text-black">List Resource</button>
      </form>
      <div className="rounded-2xl bg-brand-surface border border-brand-line p-4">Preview</div>
    </div>
  )
}
```

**`app/dashboard/page.tsx`** (Dashboard)

```tsx
export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      {/* TODO: Tabs + tables */}
      <div className="rounded-2xl bg-brand-surface border border-brand-line h-40" />
    </div>
  )
}
```

**`app/activity/page.tsx`** (Global Activity)

```tsx
export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Activity</h1>
      <div className="rounded-2xl bg-brand-surface border border-brand-line h-64" />
    </div>
  )
}
```

### Utilities placeholders

**`lib/tx.ts`**

```ts
export type TxStep = 'prepare'|'sign'|'pending'|'confirmed'|'error'
export function useTx(){
  // TODO: implement with wagmi write + wait
  return { step: 'prepare' as TxStep, write: async()=>{}, reset: ()=>{} }
}
```

**`components/app/tx-drawer.tsx`**

```tsx
'use client'
export function TxDrawer(){
  // TODO: implement drawer with steps
  return null
}
```

### Env

Add `NEXT_PUBLIC_WC_ID` to `.env.local` for WalletConnect project id.

### Commit

```bash
git add .
git commit -m "feat(ui): scaffold shell, providers, pages, theme"
```

---

