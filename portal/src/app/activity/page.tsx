"use client"
import { useState } from "react"
import { EventFeed } from "@/components/activity/event-feed"
import { mockEvents } from "@/data/mockEvents"
import { toast } from "sonner"

export default function Page() {
  const [showRaw, setShowRaw] = useState(false)

  const handleCopyTx = (txHash: string) => {
    navigator.clipboard.writeText(txHash)
    toast.success("Transaction hash copied")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Activity</h1>
      <EventFeed
        events={mockEvents}
        showRaw={showRaw}
        onToggleRaw={setShowRaw}
        onCopyTx={handleCopyTx}
      />
    </div>
  )
}
