

export function formatWeiToEth(wei: string | bigint): string {
  return (Number(wei) / 1e18).toFixed(6);
}