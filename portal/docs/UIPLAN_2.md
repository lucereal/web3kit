## PR #2 – Components with Mock Data

Now that the UI shell is live on `feature/ui-scaffold`, we’ll move to building core components and populating them with mock data so we can click through real flows before wiring up contract calls.

---

**1. Components to implement**

* **ResourceCard**

  * Props: `{ id, name, description, priceEth, seller, onView, onBuy }`
  * Displays name, short description, price in ETH, seller address pill, View/Buy buttons.
* **EventFeed**

  * Props: `{ events, showRaw, onToggleRaw, onCopyTx }`
  * Renders list of events (type, actor, resource, amount, time) with icons.
* **DevHelpersPanel**

  * Props: `{ open, onOpenChange }`
  * Contains toggles: Show Raw Logs, Simulate Tx, Copy Example cURL, Copy Tx Link.
* **TxDrawer**

  * Props: `{ open, step, txHash, block, errorMessage, onClose }`
  * Shows transaction progress: prepare → sign → pending → confirmed/error.

**2. Mock data setup**

* Add `data/mockResources.ts` and `data/mockEvents.ts` with representative objects.
* Use these in Explore, Detail, Dashboard, and Activity pages.
* Replace placeholders with mapped components.

**3. Page updates**

* **Explore:** map `mockResources` to `ResourceCard` grid.
* **Resource Detail:** show selected mock resource, load scoped mock events.
* **Create Resource:** keep form static, but preview updates from inputs.
* **Dashboard:**

  * My Resources: table using `mockResources`.
  * My Purchases: list of purchased mock resources.
  * Earnings: static withdrawable balance.
  * Activity: scoped mock events.
* **Global Activity:** `EventFeed` with all mock events.

**4. Interactions (mock)**

* Buy/List/Withdraw buttons trigger `useTx` stub to simulate:

  * Step changes (prepare → sign → pending → confirmed) with delays.
  * Success toast.
* DevHelpersPanel toggles and copy actions log to console for now.

**5. Styling**

* Match Tailwind + shadcn dark/pink theme.
* Ensure cards, feeds, and modals use brand tokens and accessible focus states.

---

**Goal for this step:**
By the end of PR #2, you should be able to navigate all pages, see mock data rendered in components, trigger mock transactions with TxDrawer animations, and use dev helper toggles—without any real blockchain calls yet.

Once approved, PR #3 will swap mock data for real wagmi/viem reads and connect the buttons to contract functions.
