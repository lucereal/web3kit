import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useAuth } from '@/contexts/AuthContext';
import { useBackendApi, useUserApi } from '@/hooks/useBackendApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export function AuthStatus() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { 
    isAuthenticated, 
    authenticate, 
    logout, 
    isLoading, 
    error, 
    canAccessBackend 
  } = useAuth();
  const { get, isLoading: apiLoading, error: apiError } = useBackendApi();
  const { getUserResources } = useUserApi();

  const handleAuth = async () => {
    const success = await authenticate();
    if (success) {
      console.log('Authentication successful!');
    }
  };

  const handleTestApiCall = async () => {
    try {
      // Example of making an authenticated API call
      const result = await get('/api/test-endpoint');
      console.log('API call result:', result);
    } catch (err) {
      console.error('API call failed:', err);
    }
  };

  const handleGetUserResources = async () => {
    if (!address) return;
    
    try {
      const resources = await getUserResources(address);
      console.log('User resources:', resources);
    } catch (err) {
      console.error('Failed to get user resources:', err);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Authentication Status
          {isAuthenticated ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          )}
        </CardTitle>
        <CardDescription>
          Connect your wallet and authenticate to access all features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wallet Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Wallet Connected:</span>
          <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-gray-500'}`}>
            {isConnected ? '✅ Connected' : '❌ Not Connected'}
          </span>
        </div>
        
        {isConnected && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Address:</span>
            <span className="text-xs text-gray-600">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
            </span>
          </div>
        )}

        {/* Backend Authentication Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Backend Access:</span>
          <span className={`text-sm ${canAccessBackend ? 'text-green-600' : 'text-gray-500'}`}>
            {canAccessBackend ? '✅ Authenticated' : '❌ Not Authenticated'}
          </span>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {!isConnected ? (
            <div className="space-y-2">
              {connectors.map((connector) => (
                <Button
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  variant="outline"
                  className="w-full"
                >
                  Connect {connector.name}
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {!isAuthenticated ? (
                <Button
                  onClick={handleAuth}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    'Authenticate for Backend Access'
                  )}
                </Button>
              ) : (
                <Button
                  onClick={logout}
                  variant="outline"
                  className="w-full"
                >
                  Logout from Backend
                </Button>
              )}
              
              <Button
                onClick={() => disconnect()}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                Disconnect Wallet
              </Button>
            </div>
          )}
        </div>

        {/* API Testing Section */}
        {isAuthenticated && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium mb-2">Backend API Testing:</h4>
            <div className="space-y-2">
              <Button 
                onClick={handleTestApiCall} 
                disabled={apiLoading}
                variant="outline" 
                size="sm"
                className="w-full"
              >
                {apiLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Test API Call'
                )}
              </Button>
              
              <Button 
                onClick={handleGetUserResources} 
                disabled={apiLoading}
                variant="outline" 
                size="sm"
                className="w-full"
              >
                {apiLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Get My Resources'
                )}
              </Button>
            </div>
            
            {apiError && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                API Error: {apiError}
              </div>
            )}
          </div>
        )}

        {/* Usage Instructions */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium mb-2">What each step enables:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• <strong>Wallet Connected:</strong> Can sign blockchain transactions</li>
            <li>• <strong>Backend Authenticated:</strong> Can read your personal data</li>
            <li>• <strong>Both Required:</strong> Full access to all features</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
