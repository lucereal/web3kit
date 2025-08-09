"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ResourceCard } from "@/components/resource/resource-card"
import { DevHelpersPanel } from "@/components/dev/dev-helpers-panel"
import { mockResources } from "@/data/mockResources"
import { useTx } from "@/lib/tx"
import { TxDrawer } from "@/components/app/tx-drawer"

export default function Page() {
  const router = useRouter()
  const { step, txHash, block, errorMessage, write, reset } = useTx()
  const [showTxDrawer, setShowTxDrawer] = useState(false)

  const handleView = (id: string) => {
    router.push(`/resource/${id}`)
  }

  const handleBuy = async (id: string) => {
    setShowTxDrawer(true)
    await write()
  }

  const handleCloseTxDrawer = () => {
    setShowTxDrawer(false)
    reset()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Explore</h1>
        <DevHelpersPanel />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockResources.map((resource) => (
          <ResourceCard
            key={resource.id}
            id={resource.id}
            name={resource.name}
            description={resource.description}
            priceEth={resource.priceEth}
            seller={resource.seller}
            category={resource.category}
            isActive={resource.isActive}
            onView={handleView}
            onBuy={handleBuy}
          />
        ))}
      </div>

      <TxDrawer
        open={showTxDrawer}
        step={step}
        txHash={txHash}
        block={block}
        errorMessage={errorMessage}
        onClose={handleCloseTxDrawer}
      />
    </div>
  )
}
