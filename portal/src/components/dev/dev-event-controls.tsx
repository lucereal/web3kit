"use client"
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function DevEventControls() {
  useEffect(() => {
    // Simple dev tools setup
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.web3kit = window.web3kit || {}
      // @ts-ignore
      window.web3kit.eventStatus = {
        strategy: 'etherscan → wagmi fallback'
      }
      
      console.log(`
🔧 Web3Kit Event Fetching Status:
Strategy: Etherscan (primary) → wagmi (fallback)

💡 Check status: window.web3kit.eventStatus
      `)
    }
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Event Fetching Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Strategy:</span>
          <span className="text-sm text-muted-foreground">Etherscan → wagmi</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Wagmi Fallback:</span>
          <Badge variant="default">Always Available</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
