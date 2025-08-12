import { useChainId, useSwitchChain } from 'wagmi'
import { sepolia } from 'wagmi/chains'

export function useNetworkGuard() {
  const chainId = useChainId()
  const { switchChain, isPending } = useSwitchChain()
  
  const onSwitch = () => switchChain({ chainId: sepolia.id })
  const wrong = chainId !== sepolia.id
  
  return { 
    wrong, 
    onSwitch, 
    isPending,
    currentChainId: chainId,
    expectedChainId: sepolia.id,
    chainName: sepolia.name
  }
}
