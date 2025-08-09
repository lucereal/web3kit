

### Quick Run
1. Compile contract
  - Run `npx hardhat compile`
2. Deploy or upgrade contract on network (localhost, sepolia, mainnet, etc)
  - To deploy run `npx hardhat run scripts/deploy/deploy-access-contract.ts --network localhost --env=dev`
  - To upgrade run `npx hardhat run scripts/deploy/upgrade-access-contract.ts --network localhost --env=dev`
3. Verify contract on network (not required for localhost)
  - Run `npx hardhat run scripts/deploy/verify-access-contract.ts --network sepolia --env=dev`
4. Test and verify with interact tasks 
  - Create resource `npx hardhat create-resource --network localhost --name "Premium API Access" --description "Access to premium API endpoints with enhanced features" --price "0.001"`
  - Buy access `npx hardhat buy-access --network localhost --resource 0`
  - Check access `npx hardhat check-access --network localhost --resource 0`
  - Check all access `npx hardhat check-access --network localhost`
  - Withdraw `npx hardhat withdraw-earnings --network localhost`
  - List resources `npx hardhat list-resources --network localhost`
  - Admin operations `npx hardhat admin-ops --network localhost --resource 0`

### Hardhat Tasks

The project includes several Hardhat tasks for interacting with the AccessContract. All tasks support the optional `--env` parameter (dev/staging/prod, defaults to dev).

#### Resource Management Tasks

**create-resource** - Create a new resource
```bash
npx hardhat create-resource --network sepolia --name "Premium API" --description "Enhanced API access" --price "0.001"
```
- `--name`: The resource name (required)
- `--description`: The resource description (required)  
- `--price`: The resource price in ETH (required)
- `--env`: Environment (dev/staging/prod, optional, defaults to dev)

**list-resources** - List all available resources
```bash
npx hardhat list-resources --network sepolia
```
Shows all resources with their details, pricing, and active status.

#### Access Management Tasks

**buy-access** - Buy access to a resource
```bash
npx hardhat buy-access --network sepolia --resource 0
```
- `--resource`: The resource ID to buy access to (required)
- `--env`: Environment (optional, defaults to dev)

**check-access** - Check access to resources
```bash
# Check access to a specific resource
npx hardhat check-access --network sepolia --resource 0

# Check access to all resources
npx hardhat check-access --network sepolia
```
- `--resource`: Specific resource ID to check (optional, leave empty to check all)
- `--env`: Environment (optional, defaults to dev)

#### Financial Tasks

**withdraw-earnings** - Withdraw seller earnings
```bash
npx hardhat withdraw-earnings --network sepolia
```
Withdraws accumulated earnings from resource sales.

#### Admin Tasks

**admin-ops** - Perform admin operations (requires contract owner)
```bash
npx hardhat admin-ops --network sepolia --resource 0
```
- `--resource`: The resource ID to operate on (required)
- `--env`: Environment (optional, defaults to dev)

Currently supports emergency deactivation of resources.


### Util Scripts
- **Address manager** - Manages contract addresses across networks and environments
- **Cancel Stuck Transaction** - Cancel transactions stuck in mempool by replacing with higher gas
  - `npx hardhat run scripts/utils/transaction/cancel-stuck-transaction.ts --network localhost --nonce=38 --gas-price="10"`
- **Check Transaction Status** - Check nonces, stuck transactions, balance, and gas prices
  - `npx hardhat run scripts/utils/transaction/check-transaction-status.ts --network localhost --address=0x742d35Cc6644C068532A5c25d0a1E3B5c0d8C123`
- **Sign Message** - Sign messages with wallet for testing authentication flows
  - `npx hardhat run scripts/utils/wallet/sign-message.ts --network localhost --message="Login to app" --nonce="a1b2c3d4"`
- **Get Topic Hash** - Generate event topic hashes for contract events
  - `npx hardhat run scripts/utils/contract/get-event-topic-hash.ts --network localhost --save`
