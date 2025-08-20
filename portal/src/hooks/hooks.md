
### useBackendApi
Handles authenticated API calls to your backend using JWT tokens
- useBackendApi() - makes authenticated API calls to backend
- useUserApi() - fetches user specific data from backend
### useContract
Read operations for blockchain queries
- useResources() - Gets all resources from blockchain
- useResource(id) - Gets a specific resource
- useHasAccess() - Checks if a user has access to a resource
- useSellerBalance() - Gets seller's earnings balance
- useNextResourceId() - Gets next available resource ID
### useContractWrites.ts 
Write operations for blockchain 
- useContractWrites() - creates resources, buys access (blockchain writes)
### useResourceDisplay
Display logic to be used across all components that show resources
### useResourceActoin
Button state management that determines button correct behavior. Centralized button logic. 
### usePageState
UI state management - controls transaction drawer visibility. Tab switching between "mock" and "live" data. 
### useNetworkGuard.ts
Checks if user is on the correct network and provides function to switch to correct network
### useDashboardData.ts
Dashboard aggregator that combines multiple data sources for a clean data layer for the dashboard page.
### useEventWatchers.ts
Watches for contract events so that UI can get real time updates.