"use client"
import { useRouter } from "next/navigation"
import { ContractResourceCard } from "@/components/resource/contract-resource-card"
import { ResourceCard } from "@/components/resource/resource-card"
import { DevHelpersPanel } from "@/components/dev/dev-helpers-panel"
import { useResources } from "@/hooks/useContract"
import { mockResources } from "@/data/mockResources"
import { useTx } from "@/lib/tx"
import { TxDrawer } from "@/components/app/tx-drawer"
import { Skeleton, Alert, AlertDescription, Button, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components"
import { usePageState } from "@/hooks/usePageState"
import type { Resource } from "@/data/resource"

export default function Page() {
  const router = useRouter()
  const { step, txHash, block, errorMessage, write, reset } = useTx()
  const { state, actions } = usePageState()
  
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
    actions.openTxDrawer()
    await write()
  }

  const handleCloseTxDrawer = () => {
    actions.closeTxDrawer()
    reset()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Explore</h1>
        <DevHelpersPanel />
      </div>
      
      <Tabs value={state.activeTab} onValueChange={(v) => actions.setActiveTab(v as any)}>
        <TabsList className="bg-card" >
          <TabsTrigger 
            value="live" 
            className="data-[state=active]:bg-light data-[state=active]:text-foreground"
          >
            Live Contract Data
          </TabsTrigger>
          <TabsTrigger 
            value="mock"
            className="data-[state=active]:bg-light data-[state=active]:text-foreground"
          >
            Mock Data
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="live" className="space-y-4">
          {resourcesError && (
            <Alert>
              <AlertDescription className="flex items-center justify-between">
                Failed to load resources from contract
                <Button size="sm" variant="outline" onClick={() => refetchResources()}>
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {resourcesLoading ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-lg" />
                </div>
              ))}
            </div>
          ) : contractResources && Array.isArray(contractResources) && contractResources.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
        open={state.showTxDrawer}
        step={step}
        txHash={txHash}
        block={block}
        errorMessage={errorMessage}
        onClose={handleCloseTxDrawer}
      />
    </div>
  )
}
