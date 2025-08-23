"use client"
import { useRouter } from "next/navigation"
import { ContractResourceCard } from "@/components/resource/contract-resource-card"
import { ResourceCard } from "@/components/resource/resource-card"
import { useExploreResources } from "@/hooks/useExploreResources"
import { mockResources } from "@/data/mockResources"
import { Skeleton, Alert, AlertDescription, Button, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components"
import { usePageState } from "@/hooks/usePageState"
import { useDebugPanel } from '@/components/app/app-shell'

export default function Page() {
  const router = useRouter()
  const { state, actions } = usePageState()
  const { showDebugPanel } = useDebugPanel()

  const {
    activeResources,
    isLoading: resourcesLoading,
    error: resourcesError,
    refetch: refetchResources,
    stats
  } = useExploreResources()

  const handleView = (id: string | bigint) => {
    router.push(`/resource/${id}`)
  }

  // Mock resource buy handler (for the mock tab only)
  const handleMockBuy = async (id: string) => {
    // This is just for demo - mock resources don't actually purchase
    console.log('Mock buy clicked for:', id)
  }

  const handleContentView = () => {
    if (showDebugPanel) {
      return handleTabsView();
    }else{
      return handleDefaultView();
    }
  }
  const handleDefaultView = () => {
    return (
      <>
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
        ) : activeResources.length > 0 ? (
          <>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {activeResources.map((resourceWithId) => (
                <ContractResourceCard
                  key={resourceWithId.resourceId.toString()}
                  resourceId={resourceWithId.resourceId}
                  resource={resourceWithId}
                  onView={handleView}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No active resources found on the contract</p>
          </div>
        )}
      </>
    )
  }
  const handleTabsView = () => {
    if (showDebugPanel) {
      return (
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
            ) : activeResources.length > 0 ? (
              <>
                <div className="text-sm text-muted-foreground mb-4">
                  Found {stats.active} active resources out of {stats.total} total
                </div>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {activeResources.map((resourceWithId) => (
                    <ContractResourceCard
                      key={resourceWithId.resourceId.toString()}
                      resourceId={resourceWithId.resourceId}
                      resource={resourceWithId}
                      onView={handleView}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No active resources found on the contract</p>
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
                  onBuy={handleMockBuy}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight">Explore Resources</h1>
          {!resourcesLoading && (
            <p className="text-sm text-muted-foreground">
              Discover {stats.active} active resources from the community
            </p>
          )}
        </div>
      </div>
      {handleContentView()}
    </div>
  )
}
