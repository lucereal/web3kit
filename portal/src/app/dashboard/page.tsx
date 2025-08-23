"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDashboardData } from "@/hooks/useDashboardData"
import { useResourceDisplay } from "@/hooks/useResourceDisplay"
import {
  User,
  Package,
  ShoppingCart,
  DollarSign,
  Eye,
  ExternalLink,
  Loader2,
  AlertCircle
} from "lucide-react"
import { useRouter } from "next/navigation"

function StatsCard({
  title,
  value,
  icon: Icon,
  description
}: {
  title: string
  value: string | number
  icon: any
  description: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function ResourceCard({
  resource,
  resourceId,
  isOwner,
  onView
}: {
  resource: any
  resourceId: bigint
  isOwner: boolean
  onView: (id: bigint) => void
}) {
  const { priceDisplay, typeDisplay } = useResourceDisplay(resource)
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{resource.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">{resource.category || 'API'}</Badge>
              <Badge variant="outline">
                {typeDisplay}
              </Badge>
              {isOwner && (
                <Badge variant="default" className="bg-green-600">
                  Owner
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold">{priceDisplay}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {resource.description}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView(resourceId)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          {resource.url && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.open(resource.url, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function Page() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const {
    createdResources,
    purchasedResources,
    stats,
    isLoading,
    error
  } = useDashboardData()

  // Debug logging
  console.log('Dashboard Page State:', {
    isConnected,
    address,
    isLoading,
    error,
    createdResourcesCount: createdResources.length,
    purchasedResourcesCount: purchasedResources.length,
    stats
  })

  const handleViewResource = (id: bigint) => {
    router.push(`/resource/${id}`)
  }

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-muted-foreground">
                Please connect your wallet to view your dashboard
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading your data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
              <p className="text-muted-foreground">
                {error.message || 'Failed to load your dashboard data'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div>
          <span className="font-mono text-sm"> Address </span>
          <Badge variant="outline" className="font-mono text-xs">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </Badge> 
        </div>
        
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Resources Created"
          value={stats.totalCreated}
          icon={Package}
          description="Resources you've published"
        />
        <StatsCard
          title="Resources Purchased"
          value={stats.totalPurchased}
          icon={ShoppingCart}
          description="Resources you own access to"
        />
        <StatsCard
          title="Total Earnings"
          value={`${stats.totalEarningsFormatted} ETH`}
          icon={DollarSign}
          description="Available to withdraw"
        />
        <StatsCard
          title="Account"
          value="Connected"
          icon={User}
          description="Wallet connected"
        />
      </div>

      {/* Resources Tabs */}
      <Tabs defaultValue="created" className="space-y-4">
        <TabsList className="bg-card">
          <TabsTrigger value="created">
            My Resources ({stats.totalCreated})
          </TabsTrigger>
          <TabsTrigger value="purchased">
            Purchased ({stats.totalPurchased})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="created" className="space-y-4">
          {createdResources.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Resources Created</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't created any resources yet
                  </p>
                  <Button onClick={() => router.push('/create')}>
                    Create Your First Resource
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {createdResources.map((resource, index) => {
                if (resource.isActive === true) {
                  return (
                    <ResourceCard
                      key={`created-${index}`}
                      resource={resource}
                      resourceId={resource.resourceId}
                      isOwner={true}
                      onView={handleViewResource}
                    />
                  )
                }

              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="purchased" className="space-y-4">
          {purchasedResources.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Purchased Resources</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't purchased access to any resources yet
                  </p>
                  <Button onClick={() => router.push('/explore')}>
                    Explore Resources
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {purchasedResources.map((resource, index) => {
                if (resource.isActive === true) {
                  return (
                    <ResourceCard
                      key={`purchased-${index}`}
                      resource={resource}
                      resourceId={resource.resourceId}
                      isOwner={false}
                      onView={handleViewResource}
                    />
                  )
                }
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
