

### Environment Setup

```bash
# Copy environment template
cp .env.example .env.local
```


Required environment variables:
```bash
# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRY=24h

# Database
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-key

# WalletConnect Project ID (required for RainbowKit)
NEXT_PUBLIC_WC_ID=your_walletconnect_project_id

# Contract Configuration
# Sepolia - 11155111
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address_here


# Alchemy URLs (Generous free tier with better performance)
# Get free API key at: https://www.alchemy.com/
NEXT_PUBLIC_ALCHEMY_URL=https://eth-sepolia.g.alchemy.com/v2/your_alchemy_api_key

# Infura RPC URL (Alternative to Alchemy)
# Get free API key at: https://infura.io/
NEXT_PUBLIC_INFURA_URL=https://sepolia.infura.io/v3/your_infura_project_id

# Event Fetching Configuration
NEXT_PUBLIC_HISTORICAL_BLOCKS=500    # How many blocks back to fetch
NEXT_PUBLIC_MAX_EVENTS=1000           # Max events per request
NEXT_PUBLIC_BLOCKS_PER_REQUEST=200      # How many blocks per request
NEXT_PUBLIC_CACHE_EVENTS=true         # Enable event caching
NEXT_PUBLIC_CACHE_DURATION=300000     # Cache duration in ms (5 minutes)

# Bearer API (optional - for additional services)
# Used for wallet based access to backend APIs 
BEARER_API_KEY=your_bearer_api_key_here

# Etherscan API Key for pulling historic events
NEXT_PUBLIC_ETHERSCAN_API_KEY=etherscan_api_key_here
```