# Web3 Template - Unlockr

A comprehensive Web3 template for building decentralized access control systems with smart contracts, event monitoring, and JWT authentication.

## 🏗️ Architecture Overview

### Smart Contracts
- **Upgradeable proxy pattern** on Ethereum (Sepolia testnet)
- **Resource marketplace** where users purchase access with ETH
- **Key Events**: `AccessPurchased`, `ResourceCreated`, `Withdrawal`
- **Access control** with usage limits and expiration times

### Backend (Next.js App Router + Vercel)
- **Event monitoring** via Alchemy webhooks → Vercel functions
- **Wallet-based authentication** with JWT issuance
- **Dual storage**: Supabase (persistent) + Redis (cache)
- **Repository pattern** with service layer architecture

### Frontend (Next.js + RainbowKit)
- **Wallet connection** via RainbowKit (MetaMask, WalletConnect)
- **Authentication flow**: Connect → Sign message → Receive JWT
- **Resource marketplace** for browsing and purchasing access

## 🛠️ Tech Stack

- **Smart Contracts**: Solidity, Upgradeable Proxies
- **Frontend**: Next.js 15, TypeScript, TailwindCSS, RainbowKit
- **Backend**: Next.js API Routes, Vercel Functions
- **Database**: Supabase (PostgreSQL)
- **Cache**: Redis (Upstash)
- **Authentication**: Wallet signatures + JWT
- **Monitoring**: Alchemy webhooks

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes & webhooks
│   └── (pages)/           # Frontend pages
├── lib/
│   ├── db/                # Database connections
│   ├── repositories/      # Data access layer
│   ├── services/          # Business logic
│   ├── events/            # Blockchain event handlers
│   └── models/            # TypeScript models
└── utils/                 # Utility functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (Supabase)
- Redis instance (Upstash)
- Ethereum wallet & RPC endpoint

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

# Cache
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Blockchain
NEXT_PUBLIC_RPC_URL=your-ethereum-rpc
NEXT_PUBLIC_CONTRACT_ADDRESS=your-contract-address
```

### Installation

```bash
# Install dependencies
npm install

# Run database migrations
# (Run the SQL in src/lib/db/schema.sql in your Supabase console)

# Start development server
npm run dev
```

## 🔧 Key Features

### Authentication Flow
1. **Connect Wallet** → User connects via RainbowKit
2. **Request Nonce** → `POST /api/auth/issue-nonce`
3. **Sign Message** → User signs authentication message
4. **Verify Signature** → `POST /api/auth/verify-signature`
5. **Receive JWT** → Use for authenticated API calls

### Event Processing
- **Webhook endpoint** receives blockchain events from Alchemy
- **Event handlers** process specific contract events
- **Service layer** manages database and cache updates
- **Type-safe** event processing with contract-generated types

### Access Control
- **Resource-based permissions** tied to blockchain events
- **Usage tracking** with limits and expiration
- **Cache-first** access validation for performance
- **Automatic cleanup** of expired access

## 🎯 Core Components

### Services
- **AccessService**: Manages resource access and permissions
- **CacheService**: Redis operations and cache management
- **RepositoryFactory**: Database access abstraction

### Event Handlers
- **Purchase events**: Grant access when payment confirmed
- **Resource events**: Create/update resource metadata
- **Withdrawal events**: Track seller earnings

### API Routes
- `/api/auth/*` - Authentication endpoints
- `/api/webhooks/blockchain` - Event processing
- Protected routes use JWT middleware

## 📋 Development Tasks

See [DEVTASKS.md](./DEVTASKS.md) for current development priorities.

## 🚦 Deployment

This template is optimized for:
- **Vercel** (recommended) - Zero-config deployment
- **Supabase** - Managed PostgreSQL
- **Upstash** - Serverless Redis
- **Alchemy** - Ethereum infrastructure

## 📖 Documentation

- **Smart Contract Events**: See contract types package
- **API Documentation**: Available in `/api` route handlers
- **Database Schema**: `src/lib/db/schema.sql`

## ⚡ Performance Features

- **Repository pattern** with interface-driven design
- **Service layer** for business logic encapsulation
- **Redis caching** for fast access validation
- **Type-safe** blockchain event processing
- **Singleton patterns** for database connections

---

**Built for Web3 developers who want a production-ready foundation for access-controlled dApps.**
