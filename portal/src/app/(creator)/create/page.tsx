"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTx } from "@/lib/tx"
import { TxDrawer } from "@/components/app/tx-drawer"

export default function Page() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "API"
  })
  const { step, txHash, block, errorMessage, write, reset } = useTx()
  const [showTxDrawer, setShowTxDrawer] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setShowTxDrawer(true)
    await write()
  }

  const handleCloseTxDrawer = () => {
    setShowTxDrawer(false)
    reset()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Create Resource</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resource Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter resource name"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your resource"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="price">Price (ETH)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.001"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="0.05"
                />
              </div>
              
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
              
              <Button type="submit" className="w-full">
                Create Resource
              </Button>
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
