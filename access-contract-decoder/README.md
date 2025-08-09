# Generate Types 
## A generic package to help you create usable typescript functions and types for your blockchain contract

### Future Enhancements
- Make access-contract-decoder more generic, allow users to pass in contract information that allows the scripts to generate the src for any contract
- Add `generate-factory.ts`
  - Creates helper functions to connect to deployed contracts
- Add `generate-react-hooks.ts`
  - For React applications - creates custom hooks



### Quick Run
1. Compile contract
  - Navigate to blockchain directory in terminal
  - Run `npm hardhat compile`
2. Get latest ABI
  - Navigate to access-contract-decoder directory in terminal
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
4. Run unit tests to verify generated sources
  - Run `npm test`
5. Build NPM package and publish 
  - Run 
    - Update package.json name, description, etc for the package you want to create
    - Build package `npm run build`
    - Verify with `npm test`
    - Login to NPM `npm login`
    - Publish package `npm publish --access public`
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