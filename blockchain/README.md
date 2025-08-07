

### Quick Run
1. Compile contract
  - Run `npx hardhat compile`
2. Deploy or upgrade contract on network (localhost, sepolia, mainnet, etc)
  - To deploy run `npx hardhat run scripts/deploy/deploy-access-contract.ts --network localhost --env=dev`
  - To upgrade run `npx hardhat run scripts/deploy/upgrade-access-contract.ts --network localhost --env=dev`
3. Verify contract on network (not required for localhost)
  - Run `npx hardhat run scripts/deploy/verify-access-contract.ts --network sepolia --env=dev`
4. Test and verify with interact scripts 
  - Create resource `npx hardhat run scripts/interact/create-resource.ts --network localhost --name="Premium API Access" --description="Access to premium API endpoints with enhanced features" --price="0.01"`
  - Buy access `npx hardhat run scripts/interact/buy-access.ts --network localhost --env=dev --resource=0`
  - Check access `npx hardhat run scripts/interact/check-access.ts --network localhost --env=dev --resource=0`
  - Withdraw `npx hardhat run scripts/interact/withdraw-earnings.ts --network localhost --env=dev`
  - List resources `npx hardhat run scripts/interact/list-resources.ts --network localhost --env=dev`
  - Admin operations `npx hardhat run scripts/interact/admin-operations.ts --network localhost --env=dev --resource=0`


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
