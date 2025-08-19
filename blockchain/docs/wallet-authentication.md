

### About
- Get nonce from issue-nonce/route.ts
- Sign message using private key and nonce
- Verify singed message using verify-signature/route.ts

### With Frontend
- ?
- ?

### Local 
- Get test wallet and private key using blockchain util script
  - `npx ts-node blockchain/scripts/utils/wallet/sign-message.ts --generate-test-wallet`
- Get nonce for test wallet address from api issue-nonce/route.ts
- Sign message with private key and nonce 
  - `npx ts-node blockchain/scripts/utils/wallet/sign-message.ts <private_key> <nonce>`
- Verify message signature using api verify-signature/route.ts
- Use returned JWT to access protected endpoints

