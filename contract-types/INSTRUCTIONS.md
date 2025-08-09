

### Quick Run
1. Compile contract
  - Navigate to blockchain directory in terminal
  - Run `npm hardhat compile`
2. Get latest ABI
  - Navigate to contract-types directory in terminal
  - Run `npm run update:abi --source=artifacts`
2. Generate constants, types, and decoders
  - Run `npm run generate:constants`
    - This generates a `constants/contract.ts` which contains event names, topics, enums, and more all from your contract ABI
  - Run `npm run generate:types`
    - This generates a `types/AccessContract.ts` which contains interfaces and types that represent your contract events and structs
  - Run `npm run generate:decoders`
    - This generates a `utils/eventDecoders.ts` which contains functions that help you decode event logs 
  - Run `npm run generate:index`
    - This generates a `index.ts` which contains all exports from your package
  - Run `npm run generate:docs`
    - This generates a `GENERATED_README.md` which contains instructions on the generated package sources
  - Or to run all `npm run generate:all`
3. Use in your app
  - `import { decodeAccessPurchased } from './utils/eventDecoding';`
  - `import { AccessPurchasedEvent } from './types/AccessContract';`



### Scripts Directory
Has scripts that are used for generating the src directory. 

### Src Directory
Has source code that will be packaged and exported so that others can access contract information through an npm package.



### Testing
Jest is used for testing the src files that were generated. 
Run `npm test`