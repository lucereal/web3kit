// Centralized component exports for easier imports

// UI Components
export { Button } from './ui/button'
export { Card, CardContent, CardFooter, CardHeader } from './ui/card'
export { Badge } from './ui/badge'
export { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
export { Alert, AlertDescription } from './ui/alert'
export { Skeleton } from './ui/skeleton'
export { Progress } from './ui/progress'

// App Components
export { AppShell } from './app/app-shell'
export { TxDrawer } from './app/tx-drawer'
export { NetworkGuard } from './app/network-guard'

// Resource Components
export { ResourceCard } from './resource/resource-card'
export { ContractResourceCard } from './resource/contract-resource-card'
export { ResourceHeader } from './resource/resource-header'
export { ResourceContent } from './resource/resource-content'
export { ResourceActions } from './resource/resource-actions'

// Dev Components
export { DevHelpersPanel } from './dev/dev-helpers-panel'


// This allows for cleaner imports:
// import { Button, Card, ResourceCard } from '@/components'
// Instead of multiple import lines
