"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ContractResourceCard } from "@/components/resource/contract-resource-card"
import { ResourceCard } from "@/components/resource/resource-card"
import { DevHelpersPanel } from "@/components/dev/dev-helpers-panel"
import { useResources } from "@/hooks/useContract"
import { mockResources } from "@/data/mockResources"
import { useTx } from "@/lib/tx"
import { TxDrawer } from "@/components/app/tx-drawer"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Resource } from "@/data/resource"

export default function Page() {
  const router = useRouter()
  const { step, txHash, block, errorMessage, write, reset } = useTx()
  const [showTxDrawer, setShowTxDrawer] = useState(false)
  const [activeTab, setActiveTab] = useState<"live" | "mock">("live")
  
  const { 
    data: contractResources, 
    isLoading: resourcesLoading, 
    error: resourcesError,
    refetch: refetchResources 
  } = useResources()

  const handleView = (id: string | bigint) => {
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
      
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="live">Live Contract Data</TabsTrigger>
          <TabsTrigger value="mock">Mock Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="live" className="space-y-4">
          {resourcesError && (
            <Alert>
              <AlertDescription className="flex items-center justify-between">
                Failed to load resources from contract
                <Button size="sm" onClick={() => refetchResources()}>
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {resourcesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-lg" />
                </div>
              ))}
            </div>
          ) : contractResources && Array.isArray(contractResources) && contractResources.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(contractResources as Resource[]).map((resource: Resource, index: number) => (
                <ContractResourceCard
                  key={index}
                  resourceId={BigInt(index)}
                  resource={resource}
                  onView={(id) => handleView(id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No resources found on the contract</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="mock" className="space-y-4">
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
        </TabsContent>
      </Tabs>

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
