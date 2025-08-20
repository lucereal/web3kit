## AuthContext
Provides backend API security for protected endpoints that verify users identity.

### Core Functionality
- JWT authenticatoin
- Wallet integration - links Web3 wallet connection with backend auth
- SIWE (Sign-In with Ethereum) - users sign a message to prove wallet ownership
- Auto-logout - clear auth when user disconnects wallet
- Auth state management - provides auth status across app

### Auth Flow
- User connects wallet (via RainbowKit)
- App calls authenticate()
- Backend issues a nonce
- User signs message with their wallet
- Backend verifies signature and returns JWT
- JWT stored for future API calls
