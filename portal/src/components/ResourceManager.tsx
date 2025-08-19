import { useState, useEffect } from 'react';
import { useContractWrites } from '@/lib/contract-writes';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wallet, Database } from 'lucide-react';
import { parseEther } from 'viem';

export function ResourceManager() {
  const { isAuthenticated, canAccessBackend } = useAuth();
  const { 
    createResource, 
    buyResource, 
    isPending, 
    isSuccess, 
    error: contractError,
    isWalletConnected 
  } = useContractWrites();

  const [myResources, setMyResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cid: '',
    url: '',
    serviceId: '',
    price: '',
    resourceType: 0
  });

  // Mock function to load user resources (replace with your backend API)
  const loadMyResources = async () => {
    if (!canAccessBackend) return;
    
    setLoadingResources(true);
    try {
      // TODO: Replace with actual API call using JWT
      // const response = await fetch('/api/user/resources', {
      //   headers: { Authorization: `Bearer ${jwt}` }
      // });
      // const resources = await response.json();
      
      // Mock data for now
      setMyResources([]);
    } catch (error) {
      console.error('Failed to load resources:', error);
    } finally {
      setLoadingResources(false);
    }
  };

  // Load resources when authenticated or after successful creation
  useEffect(() => {
    loadMyResources();
  }, [canAccessBackend, isSuccess]);

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createResource({
        name: formData.name,
        description: formData.description,
        cid: formData.cid || 'QmExample',
        url: formData.url || 'https://example.com',
        serviceId: formData.serviceId || 'default',
        price: parseEther(formData.price || '0.001'),
        resourceType: formData.resourceType
      });
      
      // Clear form on success
      if (isSuccess) {
        setFormData({
          name: '',
          description: '',
          cid: '',
          url: '',
          serviceId: '',
          price: '',
          resourceType: 0
        });
      }
    } catch (error) {
      console.error('Failed to create resource:', error);
    }
  };

  const handleBuyResource = async (resourceId: string, price: string) => {
    try {
      await buyResource(BigInt(resourceId), parseEther(price));
    } catch (error) {
      console.error('Failed to buy resource:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resource Manager</CardTitle>
          <CardDescription>
            Please connect your wallet and authenticate to manage resources.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Resource Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Create New Resource
          </CardTitle>
          <CardDescription>
            This will create a blockchain transaction that requires wallet signing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateResource} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (ETH)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.001"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cid">IPFS CID</Label>
                <Input
                  id="cid"
                  value={formData.cid}
                  onChange={(e) => setFormData({...formData, cid: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                />
              </div>
            </div>
            
            {contractError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{contractError}</p>
              </div>
            )}
            
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Resource...
                </>
              ) : (
                'Create Resource (Sign with Wallet)'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* My Resources List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            My Resources
          </CardTitle>
          <CardDescription>
            This data is loaded from the backend using JWT authentication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingResources ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading your resources...
            </div>
          ) : myResources.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              You haven't created any resources yet.
            </p>
          ) : (
            <div className="space-y-4">
              {myResources.map((resource: any) => (
                <div key={resource.id} className="p-4 border rounded-lg">
                  <h3 className="font-semibold">{resource.name}</h3>
                  <p className="text-sm text-gray-600">{resource.description}</p>
                  <p className="text-sm font-medium">Price: {resource.price_wei} ETH</p>
                  <div className="mt-2 flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled={!canAccessBackend}
                      onClick={() => console.log('Update metadata - TODO: implement with JWT')}
                    >
                      Update Metadata (Backend)
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled={isPending || !isWalletConnected}
                      onClick={() => handleBuyResource(resource.id, resource.price_wei)}
                    >
                      {isPending ? 'Processing...' : 'Test Buy (Wallet)'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
