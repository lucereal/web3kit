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

export default function Page() {
  const router = useRouter()
  const { isConnected } = useAccount()
  const { wrong: wrongNetwork, onSwitch, isPending: switchPending } = useNetworkGuard()
  const [creating, setCreating] = useState(false)
  const { step, txHash, block, errorMessage, write, reset } = useTx()
  const [showTxDrawer, setShowTxDrawer] = useState(false)
  const [useRealContract, setUseRealContract] = useState(true)
  
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
        const { hash } = await createResource({
          name: formData.name,
          description: formData.description,
          cid: formData.cid || "",
          url: formData.url || "",
          serviceId: formData.serviceId || "",
          price: priceWei,
          resourceType: formData.resourceType === "URL" ? ResourceType.URL : ResourceType.IPFS
        })
        
        toast.success("Resource created successfully!", {
          description: `Transaction: ${hash.slice(0, 10)}...`,
          action: {
            label: "View on Etherscan",
            onClick: () => window.open(`https://sepolia.etherscan.io/tx/${hash}`, '_blank')
          }
        })
        
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
        if (error.message?.includes("User rejected")) {
          toast.error("Transaction cancelled")
        } else {
          toast.error("Failed to create resource", {
            description: error.message || "Unknown error occurred"
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
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resource Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter resource name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your resource"
                  rows={3}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (ETH) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.001"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="0.05"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="resourceType">Type</Label>
                  <Select
                    value={formData.resourceType}
                    onValueChange={(value: "URL" | "IPFS") => 
                      setFormData({...formData, resourceType: value})
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
                  <div>
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      value={formData.url}
                      onChange={(e) => setFormData({...formData, url: e.target.value})}
                      placeholder="https://api.example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cid">IPFS CID</Label>
                    <Input
                      id="cid"
                      value={formData.cid}
                      onChange={(e) => setFormData({...formData, cid: e.target.value})}
                      placeholder="QmYour...Hash"
                    />
                  </div>

                  <div>
                    <Label htmlFor="serviceId">Service ID</Label>
                    <Input
                      id="serviceId"
                      value={formData.serviceId}
                      onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
                      placeholder="Optional service identifier"
                    />
                  </div>
                </>
              )}
              
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="API">API</option>
                  <option value="Storage">Storage</option>
                  <option value="Security">Security</option>
                  <option value="Analytics">Analytics</option>
                  <option value="Education">Education</option>
                  <option value="Governance">Governance</option>
                </select>
              </div>
              
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
    </div>
  )
}
