"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount, useSignMessage } from 'wagmi';

interface AuthContextType {
  // Authentication state
  isAuthenticated: boolean;
  jwt: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  authenticate: () => Promise<boolean>;
  logout: () => void;
  
  // Utilities
  getAuthHeaders: () => { Authorization?: string };
  canAccessBackend: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  
  const [jwt, setJwt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load JWT from localStorage on mount
  useEffect(() => {
    const storedJwt = localStorage.getItem('auth_jwt');
    if (storedJwt) {
      // TODO: Validate JWT expiry here
      setJwt(storedJwt);
    }
  }, []);

  // Clear auth when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      logout();
    }
  }, [isConnected]);

  const authenticate = async (): Promise<boolean> => {
    if (!address || !isConnected) {
      setError('Wallet not connected');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Get nonce from backend
      const nonceResponse = await fetch('/api/auth/issue-nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });

      if (!nonceResponse.ok) {
        throw new Error('Failed to get nonce');
      }

      const { nonce } = await nonceResponse.json();

      // Step 2: Sign the message
      const message = `Login to Unlockr:\nNonce: ${nonce}`;
      const signature = await signMessageAsync({ message });

      // Step 3: Verify signature and get JWT
      const verifyResponse = await fetch('/api/auth/verify-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature })
      });

      if (!verifyResponse.ok) {
        throw new Error('Signature verification failed');
      }

      const { token } = await verifyResponse.json();

      // Step 4: Store JWT
      setJwt(token);
      localStorage.setItem('auth_jwt', token);
      
      return true;

    } catch (err: any) {
      console.error('Authentication failed:', err);
      setError(err.message || 'Authentication failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setJwt(null);
    setError(null);
    localStorage.removeItem('auth_jwt');
  };

  const getAuthHeaders = () => {
    return jwt ? { Authorization: `Bearer ${jwt}` } : {};
  };

  const value: AuthContextType = {
    isAuthenticated: !!jwt && isConnected,
    jwt,
    isLoading,
    error,
    authenticate,
    logout,
    getAuthHeaders,
    canAccessBackend: !!jwt
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
