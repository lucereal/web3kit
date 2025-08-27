import { useHasAccess } from './useContract'

export function useCheckAllForAccess(resourceIds: bigint[]) {
  const accessResults = resourceIds.map(id => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const result = useHasAccess(id)
    return {
      resourceId: id,
      ...result
    }
  })

  const allLoaded = accessResults.every(result => !result.isLoading)
  const anyError = accessResults.some(result => result.isError)

  return {
    accessResults,
    allLoaded,
    anyError,
    getAccess: (resourceId: bigint) => 
      accessResults.find(result => result.resourceId === resourceId)
  }
}