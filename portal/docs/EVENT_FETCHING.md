# Event Fetching System Documentation

## Overview

Your activity page now uses real blockchain events instead of mock data, with an intelligent multi-provider strategy that prioritizes performance and avoids rate limits.

## Architecture

### 🔄 Intelligent Provider Strategy
1. **Alchemy** (Preferred) - Best performance, generous rate limits
2. **Etherscan** (Secondary) - Good for historical data, reliable free tier
3. **Wagmi Public Client** (Fallback) - Always available but rate-limited

### 📊 Event Sources
- **Historical Events**: Fetched on page load using the best available API
- **Real-time Events**: Live blockchain monitoring via wagmi event watchers
- **Unified Processing**: Both sources use your published decoder package for consistent typing

## Configuration

### Environment Variables

```bash
# Strategy selection: 'auto' (recommended), 'alchemy', 'etherscan', 'wagmi'
NEXT_PUBLIC_EVENT_STRATEGY=auto

# Alchemy RPC (Preferred - get free API key at https://www.alchemy.com/)
NEXT_PUBLIC_ALCHEMY_URL=https://eth-sepolia.g.alchemy.com/v2/your_api_key

# Etherscan API (Backup - get free API key at https://etherscan.io/apis)
NEXT_PUBLIC_ETHERSCAN_API_KEY=your_etherscan_api_key

# Infura RPC (Alternative RPC provider)
NEXT_PUBLIC_INFURA_URL=https://sepolia.infura.io/v3/your_project_id

# Event fetching configuration
NEXT_PUBLIC_HISTORICAL_BLOCKS=10000    # How many blocks back to fetch
NEXT_PUBLIC_MAX_EVENTS=1000           # Max events per request
NEXT_PUBLIC_CACHE_EVENTS=true         # Enable event caching
```

### Strategy Selection Logic

**Auto Mode (Recommended):**
```
✅ Alchemy available? → Use Alchemy
↳ ❌ Etherscan API key? → Use Etherscan  
  ↳ ❌ → Fall back to Wagmi (rate limited)
```

## Implementation Details

### Files Created/Modified

**New Files:**
- `src/utils/alchemy-events.ts` - Alchemy RPC event fetching
- `src/utils/etherscan-events.ts` - Etherscan API event fetching  
- `src/utils/unified-events.ts` - Intelligent strategy orchestration
- `src/config/events.ts` - Centralized configuration
- `src/hooks/useActivityEvents.ts` - Activity page event hook

**Modified Files:**
- `src/app/activity/page.tsx` - Updated to use real events
- `src/components/activity/event-feed.tsx` - Updated types
- `src/app/providers.tsx` - Enhanced RPC configuration with SSR safety
- `src/hooks/useEventWatchers.ts` - Added SSR safety checks
- `src/hooks/useContractWrites.ts` - Added SSR safety checks

### Event Processing Flow

1. **Page Load**: `useActivityEvents()` fetches historical events
2. **Strategy Selection**: Unified service chooses best available API
3. **Event Decoding**: Uses your `@san-dev/access-contract-decoder` package
4. **Real-time Updates**: wagmi watchers add new events as they occur
5. **Deduplication**: Prevents duplicate events between historical and real-time
6. **UI Display**: EventFeed shows formatted, type-safe events

## Benefits

### 🚀 Performance
- **Alchemy**: Up to 100M requests/month free tier
- **Smart Fallbacks**: Automatically uses best available option
- **Efficient Batching**: Optimized RPC calls

### 🔒 Reliability  
- **Multiple Providers**: Never dependent on single API
- **Graceful Degradation**: Works even if APIs are down
- **SSR Safe**: Handles server-side rendering properly

### 🎯 Type Safety
- **Published Package**: Uses your `@san-dev/access-contract-decoder`
- **Consistent Types**: Same interfaces throughout the app
- **Event Validation**: Automatic event format validation

## Usage

The activity page now automatically:
- Shows real blockchain events (purchases, listings, withdrawals)
- Updates in real-time as new events occur
- Displays which fetching strategy is being used
- Handles errors gracefully with fallback strategies

## Monitoring

The console will show which strategy is being used:
```
📡 Fetching historical events using strategy: alchemy
✅ Alchemy: Retrieved 42 logs
```

## Next Steps

1. **Get API Keys**: Sign up for Alchemy (recommended) or Etherscan
2. **Configure Environment**: Add your API keys to `.env.local`
3. **Test**: Deploy and verify events are loading correctly
4. **Optimize**: Adjust `HISTORICAL_BLOCKS` based on your needs
