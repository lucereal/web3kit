

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