"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateResource } from "@/hooks/useCreateResource"
import { toast } from "sonner"

export default function Page() {
  const router = useRouter()
  const [useRealContract, setUseRealContract] = useState(true)

  // Use the new create resource hook
  const {
    createResource,
    isPending: contractPending,
    isSuccess,
    hash,
    createdResource,
    showSuccessModal,
    showErrorModal,
    errorDetails,
    setShowSuccessModal,
    setShowErrorModal,
    isConnected,
    wrongNetwork,
    onSwitch,
    switchPending,
    getTransactionHashEffect,
    debug
  } = useCreateResource()

  // Handle transaction hash updates
  useEffect(() => {
    getTransactionHashEffect()
  }, [isSuccess, hash])

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "API",
    url: "",
    cid: "",
    serviceId: "",
    resourceType: "URL" as "URL" | "IPFS"
  })

  // Handle success state from hook
  useEffect(() => {
    if (isSuccess && !contractPending) {
      // Form will be reset in the handleSubmit function
      setShowSuccessModal(true)
    }
  }, [isSuccess, contractPending, setShowSuccessModal])

  // Clear success/error states
  const clearSuccessState = () => {
    setShowSuccessModal(false)
  }

  const clearErrorState = () => {
    setShowErrorModal(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (useRealContract) {
      // Real contract interaction using the hook
      try {
        await createResource(formData)
        
        // Reset form on success
        setFormData({
          name: "",
          description: "",
          price: "",
          category: "API",
          url: "",
          cid: "",
          serviceId: "",
          resourceType: "URL"
        })
        
      } catch (error: any) {
        console.error("Create resource error:", error)

        // Show appropriate toast based on error type
        let errorMessage = "Failed to create resource"
        let errorDescription = "Unknown error occurred"

        if (error.message?.includes("User rejected") || error.code === 4001) {
          errorMessage = "Transaction cancelled"
          errorDescription = "You cancelled the transaction in your wallet"
        } else if (error.message?.includes("insufficient funds")) {
          errorMessage = "Insufficient funds"
          errorDescription = "You don't have enough ETH to complete this transaction"
        } else if (error.message?.includes("execution reverted")) {
          errorMessage = "Transaction failed"
          errorDescription = "The smart contract rejected this transaction"
        }

        toast.error(errorMessage, {
          description: errorDescription
        })
      }
    } else {
      // Mock transaction - just show a simple toast
      toast.success("Mock resource created successfully!")
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "API",
        url: "",
        cid: "",
        serviceId: "",
        resourceType: "URL"
      })
    }
  }

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false)
  }

  const handleCloseErrorModal = () => {
    setShowErrorModal(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Create Resource</h1>
        <div className="flex items-center gap-2">
          <Label htmlFor="mode-toggle" className="text-sm">Real Contract:</Label>
          <input
            id="mode-toggle"
            type="checkbox"
            checked={useRealContract}
            onChange={(e) => setUseRealContract(e.target.checked)}
            className="rounded"
          />
        </div>
      </div>

      {/* Debug section for testing modals and hook states */}
      {process.env.NODE_ENV === 'development' && debug && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Debug: Test Modals & Hook States</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Hook States Display */}
            <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
              <div><strong>Hook States:</strong></div>
              <div>Contract Pending: {contractPending ? "Yes" : "No"}</div>
              <div>Is Success: {isSuccess ? "Yes" : "No"}</div>
              <div>Error Details: {errorDetails ? JSON.stringify(errorDetails, null, 2) : "None"}</div>
              <div>Hash: {hash || "None"}</div>
              <div>Show Success Modal: {showSuccessModal ? "Yes" : "No"}</div>
              <div>Show Error Modal: {showErrorModal ? "Yes" : "No"}</div>
              <div>Created Resource: {createdResource ? "Set" : "None"}</div>
              <div>Connected: {isConnected ? "Yes" : "No"}</div>
              <div>Wrong Network: {wrongNetwork ? "Yes" : "No"}</div>
            </div>

            {/* Test Buttons */}
            <div className="flex gap-2 flex-wrap">
              <Button 
                size="sm" 
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50"
                onClick={() => debug().testErrorModal('rejection')}
              >
                Test User Rejection
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50"
                onClick={() => debug().testErrorModal('insufficient_funds')}
              >
                Test Insufficient Funds
              </Button>

              <Button 
                size="sm" 
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50"
                onClick={() => debug().testErrorModal('execution_reverted')}
              >
                Test Failed TX
              </Button>

              <Button 
                size="sm" 
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50"
                onClick={() => debug().testErrorModal('network')}
              >
                Test Network Error
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                className="border-green-500 text-green-600 hover:bg-green-50"
                onClick={() => debug().testSuccessModal()}
              >
                Test Success Modal
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                onClick={() => {
                  console.log("Current form data:", formData)
                  debug().logCurrentState()
                }}
              >
                Log States
              </Button>

              <Button 
                size="sm" 
                variant="outline"
                className="border-purple-500 text-purple-600 hover:bg-purple-50"
                onClick={() => {
                  // Test the actual create function with mock data
                  const mockData = {
                    name: "Test Debug Resource",
                    description: "This is a test resource for debugging",
                    price: "0.001",
                    category: "API",
                    url: "https://api.test.com",
                    cid: "",
                    serviceId: "debug-test-001",
                    resourceType: "URL" as const
                  }
                  setFormData(mockData)
                }}
              >
                Fill Mock Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resource Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter resource name"
                  required
                  className="placeholder:text-muted-foreground/50 placeholder:italic"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your resource"
                  rows={3}
                  required
                  className="placeholder:text-muted-foreground/50 placeholder:italic"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (ETH) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.001"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g.,0.001"
                    className="placeholder:text-muted-foreground/50 placeholder:italic"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resourceType">Type</Label>
                  <Select 
                    value={formData.resourceType}
                    onValueChange={(value) => setFormData({ ...formData, resourceType: value as "URL" | "IPFS" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="URL">URL</SelectItem>
                      <SelectItem value="IPFS">IPFS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.resourceType === "URL" && (
                <div className="space-y-2">
                  <Label htmlFor="url">Resource URL *</Label>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://api.example.com"
                    className="placeholder:text-muted-foreground/50 placeholder:italic"
                  />
                </div>
              )}

              {formData.resourceType === "IPFS" && (
                <div className="space-y-2">
                  <Label htmlFor="cid">IPFS CID *</Label>
                  <Input
                    id="cid"
                    value={formData.cid}
                    onChange={(e) => setFormData({ ...formData, cid: e.target.value })}
                    placeholder="QmXyz123..."
                    className="placeholder:text-muted-foreground/50 placeholder:italic"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="API">API</SelectItem>
                    <SelectItem value="Dataset">Dataset</SelectItem>
                    <SelectItem value="Model">Model</SelectItem>
                    <SelectItem value="Tool">Tool</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceId">Service ID</Label>
                <Input
                  id="serviceId"
                  value={formData.serviceId}
                  onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                  placeholder="Optional service identifier"
                  className="placeholder:text-muted-foreground/50 placeholder:italic"
                />
              </div>

              {useRealContract && wrongNetwork && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                  <div className="flex items-center gap-2 text-yellow-800 mb-2">
                    ⚠️ Wrong Network
                  </div>
                  <p className="text-yellow-700 text-sm mb-3">
                    Please switch to Sepolia network to create resources.
                  </p>
                  <Button 
                    type="button"
                    size="sm"
                    onClick={onSwitch}
                    disabled={switchPending}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    {switchPending ? "Switching..." : "Switch Network"}
                  </Button>
                </div>
              )}

              {useRealContract && !isConnected && (
                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <div className="flex items-center gap-2 text-blue-800 mb-2">
                    ℹ️ Wallet Not Connected
                  </div>
                  <p className="text-blue-700 text-sm">
                    Please connect your wallet to create resources on the blockchain.
                  </p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={contractPending || (useRealContract && (!isConnected || wrongNetwork))}
              >
                {contractPending 
                  ? "Creating Resource..." 
                  : useRealContract 
                    ? "Create Resource" 
                    : "Mock Create Resource"
                }
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <div className="mt-1 text-sm text-muted-foreground">
                  {formData.name || "Resource name will appear here"}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <div className="mt-1 text-sm text-muted-foreground">
                  {formData.description || "Resource description will appear here"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Price</Label>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {formData.price ? `${formData.price} ETH` : "0 ETH"}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {formData.category}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Type</Label>
                <div className="mt-1 text-sm text-muted-foreground">
                  {formData.resourceType}
                </div>
              </div>

              {formData.url && (
                <div>
                  <Label className="text-sm font-medium">URL</Label>
                  <div className="mt-1 text-sm text-muted-foreground break-all">
                    {formData.url}
                  </div>
                </div>
              )}

              {formData.cid && (
                <div>
                  <Label className="text-sm font-medium">IPFS CID</Label>
                  <div className="mt-1 text-sm text-muted-foreground break-all">
                    {formData.cid}
                  </div>
                </div>
              )}

              {formData.serviceId && (
                <div>
                  <Label className="text-sm font-medium">Service ID</Label>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {formData.serviceId}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
