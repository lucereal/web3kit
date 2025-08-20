

/**
 * Convert ETH string to Wei bigint
 * Handles decimal places up to 18 digits
 */
export function parseEthToWei(ethString: string): bigint {
  const parts = ethString.split('.')
  const whole = parts[0] || '0'
  const decimal = (parts[1] || '').padEnd(18, '0').slice(0, 18)
  
  return BigInt(whole + decimal)
}

/**
 * Convert Wei bigint to ETH string with proper decimal handling
 * More precise than the simple division approach
 */
export function formatWeiToEth(wei: bigint): string {
  const weiString = wei.toString()
  const ethString = weiString.padStart(19, '0') // 18 decimals + 1 whole
  const whole = ethString.slice(0, -18) || '0'
  const decimal = ethString.slice(-18).replace(/0+$/, '') || '0'
  
  return decimal === '0' ? whole : `${whole}.${decimal}`
}

/**
 * Simple Wei to ETH conversion with fixed decimal places
 * Good for display purposes when you don't need full precision
 */
export function formatWeiToEthSimple(wei: string | bigint, decimals: number = 6): string {
  return (Number(wei) / 1e18).toFixed(decimals)
}