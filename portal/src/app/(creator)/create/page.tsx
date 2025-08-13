"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAccount } from "wagmi"
import { useNetworkGuard } from "@/hooks/useNetworkGuard"
import { createResource, parseEthToWei } from "@/lib/contract-writes"
import { ResourceType } from "@/data/resource"
import { toast } from "sonner"
import { Loader2, ArrowLeft } from "lucide-react"
import { TxDrawer } from "@/components/app/tx-drawer"
import { useTx } from "@/lib/tx"
import { ResourceSuccessModal } from "@/components/resource/resource-success-modal"
import { ResourceErrorModal } from "@/components/resource/resource-error-modal"

export default function Page() {
  const router = useRouter()
  const { isConnected } = useAccount()
  const { wrong: wrongNetwork, onSwitch, isPending: switchPending } = useNetworkGuard()
  const [creating, setCreating] = useState(false)
  const { step, txHash, block, errorMessage, write, reset } = useTx()
  const [showTxDrawer, setShowTxDrawer] = useState(false)
  const [useRealContract, setUseRealContract] = useState(true)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [createdResource, setCreatedResource] = useState<any>(null)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorDetails, setErrorDetails] = useState<any>(null)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (useRealContract) {
      // Real contract interaction
      if (!isConnected) {
        toast.error("Please connect your wallet")
        return
      }

      if (wrongNetwork) {
        toast.error("Please switch to Sepolia network")
        return
      }

      if (!formData.name || !formData.description || !formData.price) {
        toast.error("Please fill in all required fields")
        return
      }

      setCreating(true)
      try {
        const priceWei = parseEthToWei(formData.price)
        const { hash, resourceId } = await createResource({
          name: formData.name,
          description: formData.description,
          cid: formData.cid || "",
          url: formData.url || "",
          serviceId: formData.serviceId || "",
          price: priceWei,
          resourceType: formData.resourceType === "URL" ? ResourceType.URL : ResourceType.IPFS
        })

        // Set created resource data for modal
        setCreatedResource({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          resourceType: formData.resourceType,
          category: formData.category,
          url: formData.url,
          cid: formData.cid,
          serviceId: formData.serviceId,
          txHash: hash,
          resourceId: resourceId || undefined
        })

        // Show success modal
        setShowSuccessModal(true)

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
      } catch (error: any) {
        console.error("Create resource error:", error)

        // Set error details for modal
        setErrorDetails({
          message: error.message || "Unknown error occurred",
          reason: error.reason || null,
          code: error.code || null,
          txHash: error.receipt?.transactionHash || null
        })

        // Show error modal
        setShowErrorModal(true)

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

        // If transaction was submitted but failed, show Etherscan link
        if (error.receipt?.transactionHash) {
          toast.error("View failed transaction", {
            description: `Transaction: ${error.receipt.transactionHash.slice(0, 10)}...`,
            action: {
              label: "View on Etherscan",
              onClick: () => window.open(`https://sepolia.etherscan.io/tx/${error.receipt.transactionHash}`, '_blank')
            }
          })
        }
      } finally {
        setCreating(false)
      }
    } else {
      // Mock transaction
      setShowTxDrawer(true)
      await write()
    }
  }

  const handleCloseTxDrawer = () => {
    setShowTxDrawer(false)
    reset()
  }

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false)
    setCreatedResource(null)
  }

  const handleCloseErrorModal = () => {
    setShowErrorModal(false)
    setErrorDetails(null)
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

      {/* Debug section for testing error modal */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Debug: Test Error Modal</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2 flex-wrap">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setErrorDetails({
                  message: "User rejected the request",
                  reason: "User cancelled transaction in wallet",
                  code: 4001,
                  txHash: null
                })
                setShowErrorModal(true)
              }}
            >
              Test Rejection
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setErrorDetails({
                  message: "insufficient funds for intrinsic transaction cost",
                  reason: "Not enough ETH in wallet",
                  code: null,
                  txHash: null
                })
                setShowErrorModal(true)
              }}
            >
              Test Insufficient Funds
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setErrorDetails({
                  message: "execution reverted",
                  reason: "Smart contract rejected the transaction",
                  code: null,
                  txHash: "0x1234567890abcdef1234567890abcdef12345678"
                })
                setShowErrorModal(true)
              }}
            >
              Test Failed TX
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setErrorDetails({
                  message: "Network connection failed",
                  reason: "Unable to connect to blockchain network",
                  code: -32603,
                  txHash: null
                })
                setShowErrorModal(true)
              }}
            >
              Test Network Error
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-50"
              onClick={() => {
                setCreatedResource({
                  name: "Test API Resource",
                  description: "This is a test resource created for debugging the success modal",
                  price: "0.001",
                  resourceType: "URL",
                  category: "API",
                  url: "https://api.example.com/test",
                  cid: "",
                  serviceId: "test-service-001",
                  txHash: "0xabcdef1234567890abcdef1234567890abcdef12",
                  resourceId: "123"
                })
                setShowSuccessModal(true)
              }}
            >
              Test Success Modal
            </Button>
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
                    onValueChange={(value: "URL" | "IPFS") =>
                      setFormData({
                        ...formData,
                        resourceType: value,
                        // Clear the opposite field when switching
                        url: value === "IPFS" ? "" : formData.url,
                        cid: value === "URL" ? "" : formData.cid
                      })
                    }
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

              {useRealContract && (
                <>
                  {formData.resourceType === "URL" && (
                    <div className="space-y-2">
                      <Label htmlFor="url">URL</Label>
                      <Input
                        id="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        placeholder="e.g., https://api.example.com"
                        className="placeholder:text-muted-foreground/40 placeholder:italic"
                      />
                    </div>
                  )}

                  {formData.resourceType === "IPFS" && (
                    <div className="space-y-2">
                      <Label htmlFor="cid">IPFS CID</Label>
                      <Input
                        id="cid"
                        value={formData.cid}
                        onChange={(e) => setFormData({ ...formData, cid: e.target.value })}
                        placeholder="e.g., QmYour...Hash"
                        className="placeholder:text-muted-foreground/40 placeholder:italic"
                      />
                    </div>
                  )}

                  {/* <div>
                    <Label htmlFor="serviceId">Service ID</Label>
                    <Input
                      id="serviceId"
                      value={formData.serviceId}
                      onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
                      placeholder="e.g., service-001 (optional)"
                      className="placeholder:text-muted-foreground/40 placeholder:italic"
                    />
                  </div> */}
                </>
              )}

              {/* <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger fullWidth>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="API">API</SelectItem>
                    <SelectItem value="Storage">Storage</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Analytics">Analytics</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Governance">Governance</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}

              {useRealContract ? (
                !isConnected ? (
                  <Button type="button" className="w-full" disabled>
                    Connect Wallet to Create
                  </Button>
                ) : wrongNetwork ? (
                  <Button
                    type="button"
                    className="w-full"
                    onClick={onSwitch}
                    disabled={switchPending}
                  >
                    {switchPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      "Switch to Sepolia Network"
                    )}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="gradient"
                    className="w-full"
                    disabled={creating}
                  >
                    {creating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      "Create Resource"
                    )}
                  </Button>
                )
              ) : (
                <Button type="submit" className="w-full">
                  Create Resource (Mock)
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-dashed border-border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm leading-tight">
                  {formData.name || "Resource Name"}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {formData.category}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground">
                {formData.description || "Resource description will appear here..."}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">
                  {formData.price || "0.00"} ETH
                </span>
              </div>

              <div className="text-xs text-muted-foreground">
                <span>Seller: </span>
                <code className="px-1 py-0.5 bg-muted rounded text-xs">
                  0x742d...8B5
                </code>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" disabled>
                  View
                </Button>
                <Button size="sm" className="flex-1" disabled>
                  Buy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <TxDrawer
        open={showTxDrawer}
        step={step}
        txHash={txHash}
        block={block}
        errorMessage={errorMessage}
        onClose={handleCloseTxDrawer}
      />

      <ResourceSuccessModal
        open={showSuccessModal}
        onClose={handleCloseSuccessModal}
        resource={createdResource}
      />

      <ResourceErrorModal
        open={showErrorModal}
        onClose={handleCloseErrorModal}
        error={errorDetails}
      />
    </div>
  )
}
