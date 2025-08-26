"use client"

import { useState } from 'react'
import { useDebugPanel } from '@/components/app/app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'

// Props interface to receive all the needed data from the create page
interface CreateDebugPanelProps {
  // Hook states
  contractPending: boolean
  isSuccess: boolean
  errorDetails: any
  hash: string | undefined
  showSuccessModal: boolean
  showErrorModal: boolean
  createdResource: any
  isConnected: boolean
  wrongNetwork: boolean
  
  // Form data
  formData: any
  setFormData: (data: any) => void
  
  // Debug functions
  debug?: () => {
    testErrorModal: (errorType?: "rejection" | "insufficient_funds" | "execution_reverted" | "network") => void
    testSuccessModal: () => void
    logCurrentState: () => void
  }
}

export default function CreateDebugPanel({
  contractPending,
  isSuccess,
  errorDetails,
  hash,
  showSuccessModal,
  showErrorModal,
  createdResource,
  isConnected,
  wrongNetwork,
  formData,
  setFormData,
  debug
}: CreateDebugPanelProps) {
  const { showDebugPanel } = useDebugPanel()

  // Don't render if debug panel is not enabled or debug function is not available
  if (!showDebugPanel || !debug) {
    return null
  }


  return (
    <>
      {/* Debug section for testing modals and hook states */}
      {process.env.NODE_ENV === 'development' && (
        <Card variant="glass" className="border-mint-green">
          <CardHeader>
            <CardTitle className="text-mint-green">Debug: Test Modals & Hook States</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">


            {/* Test Buttons */}
            <div className="flex gap-2 flex-wrap">
              <Button 
                size="sm" 
                variant="redwood"
                
                onClick={() => {
                  console.log('Testing user rejection...')
                  debug()?.testErrorModal('rejection')
                }}
              >
                Test User Rejection
              </Button>
              
              <Button 
                size="sm" 
                variant="redwood"
                
                onClick={() => {
                  console.log('Testing insufficient funds...')
                  debug()?.testErrorModal('insufficient_funds')
                }}
              >
                Test Insufficient Funds
              </Button>

              <Button 
                size="sm" 
                variant="redwood"
                
                onClick={() => {
                  console.log('Testing failed transaction...')
                  debug()?.testErrorModal('execution_reverted')
                }}
              >
                Test Failed TX
              </Button>

              <Button 
                size="sm" 
                variant="redwood"
                
                onClick={() => {
                  console.log('Testing network error...')
                  debug()?.testErrorModal('network')
                }}
              >
                Test Network Error
              </Button>
              
              <Button 
                size="sm" 
                variant="redwood"
          
                onClick={() => {
                  console.log('Testing success modal...')
                  debug()?.testSuccessModal()
                }}
              >
                Test Success Modal
              </Button>
              
              <Button 
                size="sm" 
                variant="redwood"
         
                onClick={() => {
                  console.log('Logging current states...')
                  console.log("Current form data:", formData)
                  debug()?.logCurrentState()
                }}
              >
                Log States
              </Button>

              <Button 
                size="sm" 
                variant="redwood"
            
                onClick={() => {
                  console.log('Filling mock data...')
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
    </>
  )
}
