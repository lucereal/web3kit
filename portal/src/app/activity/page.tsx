"use client"
import { useState } from "react"
import { EventFeed } from "@/components/activity/event-feed"
import { useActivityEvents } from "@/hooks/useActivityEvents"
import { toast } from "sonner"
import EventProviderDebugPanel from "@/components/dev/event-provider-debug-panel"

export default function Page() {
  const [showRaw, setShowRaw] = useState(false)
  const { events, isLoading, error, strategy } = useActivityEvents(50)

  const handleCopyTx = (txHash: string) => {
    navigator.clipboard.writeText(txHash)
    toast.success("Transaction hash copied")
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold">Activity</h1>
        <div className="text-red-500">Error loading events: {error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Debug panel - remove after fixing providers */}
      <EventProviderDebugPanel />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">Activity</h1>
         
        </div>
        {isLoading && <div className="text-sm text-gray-500">Loading events...</div>}
      </div>
      <EventFeed
        events={events}
        showRaw={showRaw}
        onToggleRaw={setShowRaw}
        onCopyTx={handleCopyTx}
      />
    </div>
  )
}
