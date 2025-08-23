# Alchemy API Key Troubleshooting

## Common Issues with Alchemy 400 Errors:

### 1. **API Key Format**
Your current URL: `https://eth-sepolia.g.alchemy.com/v2/XCEezL6xlcKC9MeqNJlmk`

**Check:**
- The API key part after `/v2/` should be longer (usually 32+ characters)
- Make sure you're using the correct API key for Sepolia testnet

### 2. **Network Mismatch** 
- Your contract is on Sepolia (`11155111`)
- Make sure your Alchemy app is configured for Sepolia testnet

### 3. **Request Limits**
- Free tier: 300 requests/second
- Check if you've exceeded limits

## Quick Fix Steps:

1. **Get a new Alchemy API key:**
   - Go to https://www.alchemy.com/
   - Create account / log in
   - Create new app for "Ethereum Sepolia"
   - Copy the full HTTP URL

2. **Update your .env.local:**
   ```bash
   NEXT_PUBLIC_ALCHEMY_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_FULL_API_KEY_HERE
   ```

## Temporary Workaround:

You can disable Alchemy and use Etherscan instead by:
1. Get free Etherscan API key: https://etherscan.io/apis
2. Update .env.local:
   ```bash
   NEXT_PUBLIC_EVENT_STRATEGY=etherscan
   NEXT_PUBLIC_ETHERSCAN_API_KEY=your_etherscan_api_key
   ```

The system will automatically fall back to wagmi if both fail.
