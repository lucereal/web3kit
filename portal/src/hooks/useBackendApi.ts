import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export interface ApiCallOptions extends RequestInit {
  skipAuth?: boolean
}

export function useBackendApi() {
  const { jwt, isAuthenticated, getAuthHeaders } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiCall = async <T = any>(
    endpoint: string, 
    options: ApiCallOptions = {}
  ): Promise<T> => {
    const { skipAuth = false, ...fetchOptions } = options

    // Check authentication unless skipAuth is true
    if (!skipAuth && (!isAuthenticated || !jwt)) {
      throw new Error('Authentication required - please connect wallet and sign in')
    }

    setIsLoading(true)
    setError(null)

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(skipAuth ? {} : getAuthHeaders()),
        ...fetchOptions.headers
      }

      const response = await fetch(endpoint, {
        ...fetchOptions,
        headers
      })

      if (!response.ok) {
        // Handle different HTTP status codes
        if (response.status === 401) {
          throw new Error('Authentication expired - please sign in again')
        } else if (response.status === 403) {
          throw new Error('Access denied')
        } else if (response.status === 404) {
          throw new Error('Resource not found')
        } else if (response.status >= 500) {
          throw new Error('Server error - please try again later')
        }

        // Try to get error message from response
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      // Handle different content types
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        return await response.json()
      } else {
        return await response.text() as T
      }

    } catch (err: any) {
      console.error(`API call to ${endpoint} failed:`, err)
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Convenience methods for common HTTP verbs
  const get = <T = any>(endpoint: string, options?: ApiCallOptions) => 
    apiCall<T>(endpoint, { method: 'GET', ...options })

  const post = <T = any>(endpoint: string, data?: any, options?: ApiCallOptions) => 
    apiCall<T>(endpoint, { 
      method: 'POST', 
      body: data ? JSON.stringify(data) : undefined,
      ...options 
    })

  const put = <T = any>(endpoint: string, data?: any, options?: ApiCallOptions) => 
    apiCall<T>(endpoint, { 
      method: 'PUT', 
      body: data ? JSON.stringify(data) : undefined,
      ...options 
    })

  const del = <T = any>(endpoint: string, options?: ApiCallOptions) => 
    apiCall<T>(endpoint, { method: 'DELETE', ...options })

  const patch = <T = any>(endpoint: string, data?: any, options?: ApiCallOptions) => 
    apiCall<T>(endpoint, { 
      method: 'PATCH', 
      body: data ? JSON.stringify(data) : undefined,
      ...options 
    })

  return {
    // Generic API call
    apiCall,
    
    // HTTP method shortcuts
    get,
    post,
    put,
    delete: del,
    patch,
    
    // State
    isLoading,
    error,
    isAuthenticated,
    
    // Utils
    clearError: () => setError(null),
    getAuthHeaders
  }
}

// Specialized hook for user data operations
export function useUserApi() {
  const api = useBackendApi()

  const getUserResources = async (address: string) => {
    return api.get(`/api/users/${address}/resources`)
  }

  const getUserPurchases = async (address: string) => {
    return api.get(`/api/users/${address}/purchases`)
  }

  const getUserProfile = async (address: string) => {
    return api.get(`/api/users/${address}/profile`)
  }

  return {
    getUserResources,
    getUserPurchases,
    getUserProfile,
    ...api
  }
}
