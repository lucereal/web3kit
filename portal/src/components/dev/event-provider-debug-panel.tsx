"use client"

import { useState } from 'react'
import { testEtherscanConnection } from '@/utils/debug-etherscan'

export default function EventProviderDebugPanel() {
  const [testing, setTesting] = useState<{ etherscan: boolean }>({
    etherscan: false
  })
  const [results, setResults] = useState<{ etherscan: string }>({
    etherscan: ''
  })

  const runEtherscanTest = async () => {
    setTesting(prev => ({ ...prev, etherscan: true }))
    setResults(prev => ({ ...prev, etherscan: '' }))
    
    try {
      console.log('=== ETHERSCAN DEBUG TEST ===')
      
      // Test connection
      const success = await testEtherscanConnection()
      
      setResults(prev => ({ 
        ...prev, 
        etherscan: success ? 
          `✅ Connection successful!\nCheck console for details.` :
          `❌ Connection failed. Check console for error details.`
      }))
    } catch (error) {
      console.error('Etherscan debug test error:', error)
      setResults(prev => ({ 
        ...prev, 
        etherscan: `❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }))
    } finally {
      setTesting(prev => ({ ...prev, etherscan: false }))
    }
  }

  return (
    <div className="border border-gray-300 rounded-lg p-4 m-4 bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">🔧 Event Provider Debug Panel</h3>
      <p className="text-sm text-gray-600 mb-4">
        Test your blockchain event provider connections and API keys
      </p>
      
      <div className="mb-4">
        <button
          onClick={runEtherscanTest}
          disabled={testing.etherscan}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {testing.etherscan ? 'Testing...' : 'Test Etherscan'}
        </button>
      </div>
      
      {/* Results Display */}
      <div className="space-y-4">
        {results.etherscan && (
          <div className="bg-white border rounded p-3">
            <h4 className="font-medium text-green-700 mb-2">Etherscan Results</h4>
            <pre className="text-sm whitespace-pre-wrap">{results.etherscan}</pre>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p><strong>This panel tests:</strong></p>
        <ul className="list-disc list-inside mt-1">
          <li>API key validity for each provider</li>
          <li>Network connection (should be Sepolia testnet)</li>
          <li>Basic API functionality (block number, logs query)</li>
          <li>Event signature extraction from contract ABI</li>
        </ul>

      </div>
    </div>
  )
}
