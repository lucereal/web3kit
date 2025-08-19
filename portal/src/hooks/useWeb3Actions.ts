import { useAuth } from '../contexts/AuthContext';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { useState } from 'react';

// Hook for backend API calls (uses JWT)
export function useBackendApi() {
  const { getAuthHeaders, canAccessBackend } = useAuth();

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    if (!canAccessBackend) {
      throw new Error('Not authenticated for backend access');
    }

    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  };

  return {
    fetchWithAuth,
    canAccessBackend,
  };
}

// Hook for blockchain transactions (uses wallet signing)
export function useContractActions() {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const [error, setError] = useState<string | null>(null);

  const createResource = async (params: {
    name: string;
    description: string;
    cid: string;
    url: string;
    serviceId: string;
    price: string; // in ETH
    resourceType: number;
  }) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    setError(null);
    
    try {
      await writeContract({
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
        abi: [], // Your contract ABI here
        functionName: 'createResource',
        args: [
          params.name,
          params.description,
          params.cid,
          params.url,
          params.serviceId,
          parseEther(params.price),
          params.resourceType,
        ],
      });
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
      throw err;
    }
  };

  const buyAccess = async (resourceId: string, price: string) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    setError(null);
    
    try {
      await writeContract({
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
        abi: [], // Your contract ABI here
        functionName: 'buyAccess',
        args: [resourceId],
        value: parseEther(price),
      });
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
      throw err;
    }
  };

  return {
    createResource,
    buyAccess,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook for reading user-specific data (uses JWT)
export function useUserData() {
  const { fetchWithAuth, canAccessBackend } = useBackendApi();
  const { address } = useAccount();

  const getMyResources = async () => {
    if (!address) throw new Error('Wallet not connected');
    return fetchWithAuth(`/api/user/${address}/resources`);
  };

  const getMyPurchases = async () => {
    if (!address) throw new Error('Wallet not connected');
    return fetchWithAuth(`/api/user/${address}/purchases`);
  };

  const getMyAccess = async (resourceId: string) => {
    if (!address) throw new Error('Wallet not connected');
    return fetchWithAuth(`/api/user/${address}/access/${resourceId}`);
  };

  return {
    getMyResources,
    getMyPurchases,
    getMyAccess,
    canAccessBackend,
  };
}
