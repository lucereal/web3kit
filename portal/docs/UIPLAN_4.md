PR #4 – Dev Helpers, Simulation, and Raw Logs

Objective: Add the teaching tools and developer utilities; finalize Activity UX polish.

Features

Tx Simulator (Dialog)

Runs simulateContract for createResource, buyAccess, withdraw with current form/selection values.

Shows success or revert reason (decoded), estimated gas, and calldata preview.

Raw Logs Drawer

For any event row: toggle to show decoded args + raw topics[]/data, logIndex, blockNumber, transactionHash.

Copy buttons for args JSON and raw log JSON.

Copy Helpers

Copy Tx Link (Etherscan Sepolia) from buttons and event rows.

Copy Example cURL for: POST /api/webhook/alchemy (sample payload), POST /api/purchase, GET /api/events?....

Redact any auth headers in examples.

Latency Overlay (optional)

Timeline: prepare → sign → pending → mined with ms deltas.

Dev Mode

NEXT_PUBLIC_DEV_MODE=true shows top banner and enables keyboard D toggle.

Components

TxSimulatorModal { open, onOpenChange, op: 'list'|'buy'|'withdraw', args: {...} }

RawLogsDrawer { open, onOpenChange, log }

ClipboardButton util

Extend EventRow with onShowRaw() and onCopyTx() props

UX Notes

Simulator button appears next to primary CTAs when Dev Mode is on.

Raw logs toggle lives per-row in Activity and Resource Detail feeds.

Testing

Simulate all three ops with valid/invalid args and confirm revert reasons render.

Verify copied payloads and links.

PR #5 – Performance, Pagination, and Robustness

Objective: Smooth large lists/feeds and harden the app for edge cases.

Tasks

Activity Pagination

Backend: /api/events?limit=50&cursor=… against Supabase (or Alchemy via server) with stable sort by (blockNumber, logIndex).

Frontend: infinite scroll or “Load more”, dedupe with watcher using txHash:logIndex set.

Explore List Pagination

If getAllResources() grows, switch to backend index endpoint; otherwise keep contract read.

Virtualization

Use @tanstack/react-virtual for Activity if needed.

Error Surfaces

Centralize error decoding (UserRejected vs. contract revert) and route to TxDrawer.

Loading Skeletons

Ensure all pages have skeleton states.

PR #6 – Accessibility & UX Polish

Objective: Hit WCAG targets and finish visual polish.

Tasks

Keyboard traps, focus order, visible focus on all interactive elements.

Color contrast audit for dark + pink palette.

Announce tx state changes to screen readers (aria-live region in TxDrawer).

Empty states with helpful CTAs; confirmations with explorer links.

PR #7 – Security & Testing

Objective: Basic safety nets for a public starter.

Tasks

Input validation (Zod) for Create form; sanitize/escape descriptions/URLs in UI.

Allowlist chain id; guard against mixed-chain configs.

Basic unit tests for formatters, helpers; integration test for buy/withdraw happy path using viem’s test or Playwright (headless connect).

PR #8 – Docs & Deploy

Objective: Make it easy for others to fork, run, and learn.

Tasks

README: quickstart, env vars, flows (list/buy/withdraw), event model, Dev Mode guide.

Screenshots/gifs of the flows and Dev Helpers.

Vercel deploy button with NEXT_PUBLIC_… placeholders.