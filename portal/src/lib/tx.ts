export type TxStep = 'prepare'|'sign'|'pending'|'confirmed'|'error'
export function useTx(){
  // TODO: implement with wagmi write + wait
  return { step: 'prepare' as TxStep, write: async()=>{}, reset: ()=>{} }
}
