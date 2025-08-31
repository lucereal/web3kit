# Web3Kit

A comprehensive Web3 template for building decentralized access control systems with smart contracts, event monitoring, and JWT authentication. 

This app is a market place where users can list resources (IPFS, URLs) on Ethereum (Sepolia) blockchain for others to purchase. 

It is to be used as a template for future projects and for proof of concept. 

## Components

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

### NPM Published Event Decoder
- **Automatically** generates decoder and types using contract ABI
- **Decoding functions** for consistent usage around the app
- **Types** generation for event interaction

## 🛠️ Tech Stack

- **Blockchain**: Solidity, Upgradeable Proxies, Hardhat, Alchemy, Etherscan
- **Frontend**: Next.js 15, TypeScript, TailwindCSS, RainbowKit
- **Backend**: Next.js API Routes, Vercel Functions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Wallet signatures + JWT

## 📁 Project Structure

- access-contract-decoder - NPM pubished package for typing decoding blockchain events
- portal - NextJS frontend and functions for Vercel
- blockchain - Blockchain contract setup

## Outstanding Dev Tasks
- UI event listening 
- Setup Base network
- Setup Ethereum mainnet network