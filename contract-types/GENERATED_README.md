# AccessContract SDK

> Auto-generated TypeScript SDK for the AccessContract smart contract

## 🚀 Installation

```bash
npm install contract-types
```

## 📋 Overview

This package provides TypeScript types, constants, and utilities for interacting with the **AccessContract** smart contract. It's auto-generated from the contract ABI to ensure type safety and up-to-date definitions.

- **Contract Version**: Retrieved dynamically via `VERSION` constant
- **Solidity Version**: `0.8.24`
- **Events**: 5 contract events
- **Functions**: 7 state-changing functions
- **View Functions**: 12 read-only functions

## 🎯 Quick Start

```typescript
import { 
  ResourceType, 
  EVENT_TOPICS, 
  decodeAccessContractEvent,
  getContractVersion 
} from 'contract-types';

// Use contract constants
console.log('Resource types:', ResourceType);

// Decode events
const decodedEvent = decodeAccessContractEvent(eventLog);

// Get contract version
const version = await getContractVersion(contractInstance);
```

## 📚 API Reference

### Constants

```typescript
import { 
  CONTRACT_NAME,
  ResourceType,
  EVENT_NAMES,
  EVENT_TOPICS,
  GAS_LIMITS 
} from 'contract-types';
```

### Types

```typescript
import type { 
  Resource,
  Access,
  AccessContractEvent,
  RawLog 
} from 'contract-types';
```

### Event Decoding

```typescript
import { 
  decodeEvent,
  decodeAccessContractEvent,
  decodeAccessPurchased,
  decodeResourceCreated 
} from 'contract-types';

// Generic event decoding
const parsed = decodeEvent(log);

// Contract-specific decoding
const event = decodeAccessContractEvent(log);

// Event-specific decoding
const accessEvent = decodeAccessPurchased(log);
```

## 🏗️ Contract Events

### AccessPurchased

```solidity
event AccessPurchased(resourceId: uint256, buyer: address, amountPaid: uint256, purchasedAt: uint256)
```

**Topic Hash**: `0x79f205d05e1d9f99a7e4a6d2e5d9fc75c372c7033d239fefe5e5dec18d472bd9`

### Initialized

```solidity
event Initialized(version: uint64)
```

**Topic Hash**: `0xc7f505b2f371ae2175ee4913f4499e1f2633a7b5936321eed1cdaeb6115181d2`

### OwnershipTransferred

```solidity
event OwnershipTransferred(previousOwner: address, newOwner: address)
```

**Topic Hash**: `0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0`

### ResourceCreated

```solidity
event ResourceCreated(resourceId: uint256, owner: address, name: string, description: string, cid: string, url: string, serviceId: string, price: uint256, createdAt: uint256, resourceType: uint8)
```

**Topic Hash**: `0xd00b0eccef06959b19bd218ebba7e050d53825f9c816c2ef6c16f5a41f71c2ed`

### Withdrawal

```solidity
event Withdrawal(seller: address, amount: uint256)
```

**Topic Hash**: `0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65`

## ⚙️ Contract Functions

### State-Changing Functions

- `buyAccess(resourceId: uint256)` → `void`
- `createResource(name: string, description: string, cid: string, url: string, serviceId: string, price: uint256, resourceType: uint8)` → `void`
- `emergencyDeactivateResource(resourceId: uint256)` → `void`
- `initialize()` → `void`
- `renounceOwnership()` → `void`


*...and 2 more functions*

### View Functions

- `VERSION()` → `string`
- `buyerAccess(: address, : uint256)` → `uint256, uint256`
- `getAllResourceIds()` → `uint256[]`
- `getAllResources()` → `tuple[]`
- `getResource(resourceId: uint256)` → `tuple`


*...and 7 more view functions*

## 🔧 Advanced Usage

### Working with Events

```typescript
import { EVENT_TOPICS, decodeResourceCreated } from 'contract-types';

// Filter logs by event topic
const resourceCreatedTopic = EVENT_TOPICS['ResourceCreated(uint256,address,string,string,string,string,string,uint256,uint256,uint8)'];

const logs = await provider.getLogs({
  address: contractAddress,
  topics: [resourceCreatedTopic],
  fromBlock: startBlock,
  toBlock: endBlock
});

// Decode the events
const decodedEvents = logs.map(log => decodeResourceCreated(log));
```

### Gas Estimation

```typescript
import { GAS_LIMITS } from 'contract-types';

// Use recommended gas limits
const tx = await contract.createResource(
  // ... parameters
  { gasLimit: GAS_LIMITS.createResource }
);
```

### Type Safety

```typescript
import type { Resource, AccessPurchasedEvent } from 'contract-types';

// Strongly typed resource data
const resource: Resource = {
  owner: '0x...',
  name: 'My Resource',
  description: 'Description',
  cid: 'QmHash...',
  url: 'https://...',
  serviceId: 'service123',
  price: BigInt('1000000000000000000'), // 1 ETH in wei
  isActive: true,
  resourceType: ResourceType.IPFS,
  createdAt: BigInt(Date.now())
};

// Strongly typed event handling
function handleAccessPurchased(event: AccessPurchasedEvent) {
  console.log(`Access purchased for resource ${event.resourceId}`);
  console.log(`Buyer: ${event.buyer}`);
  console.log(`Amount: ${event.amountPaid}`);
}
```

## 🏗️ Development

This package is auto-generated from the smart contract ABI. To regenerate:

```bash
npm run update        # Update ABI from blockchain artifacts
npm run generate:all  # Generate all TypeScript definitions
```

### Available Scripts

- `npm run update` - Update ABI from contract artifacts
- `npm run generate:constants` - Generate contract constants
- `npm run generate:types` - Generate TypeScript interfaces
- `npm run generate:decoders` - Generate event decoders
- `npm run generate:index` - Generate package index
- `npm run generate:docs` - Generate this documentation
- `npm run generate:all` - Run all generators

## 📄 License

MIT

---

*This documentation was auto-generated from the AccessContract smart contract ABI.*
