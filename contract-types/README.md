

### Quick Run
1. Get latest ABI
  - Run `npm run update-abi -- --source=artifacts`
2. Generate constants, types, and decoders
  - Run `npm run generate-constants`
  - Run `npm run generate-types`
  - Run `npm run generate-decoders`
3. Use in your app
  - `import { decodeAccessPurchased } from './utils/eventDecoding';`
  - `import { AccessPurchasedEvent } from './types/AccessContract';`
