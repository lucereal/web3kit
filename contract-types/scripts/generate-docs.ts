import * as fs from "fs";
import * as path from "path";
import { Interface } from "@ethersproject/abi";
import { readABI } from "./utils/abi-reader";

async function generateDocs() {
  const { abi, artifact } = await readABI();
  const contractName = artifact.contractName || 'AccessContract';
  const version = artifact.compiler?.version || '0.8.24';
  
  // Create interface to get event topics
  const iface = new Interface(abi);
  const eventTopics: Record<string, string> = {};
  Object.keys(iface.events).forEach(eventName => {
    const cleanName = eventName.split('(')[0];
    eventTopics[cleanName] = iface.getEventTopic(eventName);
  });
  
  // Extract events for documentation
  const events = abi.filter(item => item.type === 'event');
  const functions = abi.filter(item => item.type === 'function' && item.stateMutability !== 'view');
  const viewFunctions = abi.filter(item => item.type === 'function' && item.stateMutability === 'view');
  
  const content = `# ${contractName} SDK

> Auto-generated TypeScript SDK for the ${contractName} smart contract

## 🚀 Installation

\`\`\`bash
npm install contract-types
\`\`\`

## 📋 Overview

This package provides TypeScript types, constants, and utilities for interacting with the **${contractName}** smart contract. It's auto-generated from the contract ABI to ensure type safety and up-to-date definitions.

- **Contract Version**: Retrieved dynamically via \`VERSION\` constant
- **Solidity Version**: \`${version}\`
- **Events**: ${events.length} contract events
- **Functions**: ${functions.length} state-changing functions
- **View Functions**: ${viewFunctions.length} read-only functions

## 🎯 Quick Start

\`\`\`typescript
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
\`\`\`

## 📚 API Reference

### Constants

\`\`\`typescript
import { 
  CONTRACT_NAME,
  ResourceType,
  EVENT_NAMES,
  EVENT_TOPICS,
  GAS_LIMITS 
} from 'contract-types';
\`\`\`

### Types

\`\`\`typescript
import type { 
  Resource,
  Access,
  AccessContractEvent,
  RawLog 
} from 'contract-types';
\`\`\`

### Event Decoding

\`\`\`typescript
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
\`\`\`

## 🏗️ Contract Events

${events.map(event => {
  const params = event.inputs?.map(input => `${input.name}: ${input.type}`).join(', ') || '';
  return `### ${event.name}

\`\`\`solidity
event ${event.name}(${params})
\`\`\`

**Topic Hash**: \`${eventTopics[event.name] || 'N/A'}\``;
}).join('\n\n')}

## ⚙️ Contract Functions

### State-Changing Functions

${functions.slice(0, 5).map(func => {
  const params = func.inputs?.map(input => `${input.name}: ${input.type}`).join(', ') || '';
  const returns = func.outputs?.map(output => output.type).join(', ') || 'void';
  return `- \`${func.name}(${params})\` → \`${returns}\``;
}).join('\n')}

${functions.length > 5 ? `\n*...and ${functions.length - 5} more functions*` : ''}

### View Functions

${viewFunctions.slice(0, 5).map(func => {
  const params = func.inputs?.map(input => `${input.name}: ${input.type}`).join(', ') || '';
  const returns = func.outputs?.map(output => output.type).join(', ') || 'void';
  return `- \`${func.name}(${params})\` → \`${returns}\``;
}).join('\n')}

${viewFunctions.length > 5 ? `\n*...and ${viewFunctions.length - 5} more view functions*` : ''}

## 🔧 Advanced Usage

### Working with Events

\`\`\`typescript
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
\`\`\`

### Gas Estimation

\`\`\`typescript
import { GAS_LIMITS } from 'contract-types';

// Use recommended gas limits
const tx = await contract.createResource(
  // ... parameters
  { gasLimit: GAS_LIMITS.createResource }
);
\`\`\`

### Type Safety

\`\`\`typescript
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
  console.log(\`Access purchased for resource \${event.resourceId}\`);
  console.log(\`Buyer: \${event.buyer}\`);
  console.log(\`Amount: \${event.amountPaid}\`);
}
\`\`\`

## 🏗️ Development

This package is auto-generated from the smart contract ABI. To regenerate:

\`\`\`bash
npm run update        # Update ABI from blockchain artifacts
npm run generate:all  # Generate all TypeScript definitions
\`\`\`

### Available Scripts

- \`npm run update\` - Update ABI from contract artifacts
- \`npm run generate:constants\` - Generate contract constants
- \`npm run generate:types\` - Generate TypeScript interfaces
- \`npm run generate:decoders\` - Generate event decoders
- \`npm run generate:index\` - Generate package index
- \`npm run generate:docs\` - Generate this documentation
- \`npm run generate:all\` - Run all generators

## 📄 License

MIT

---

*This documentation was auto-generated from the ${contractName} smart contract ABI.*
`;
  
  return content;
}

async function saveDocs(content: string) {
  const docsPath = path.join(process.cwd(), "GENERATED_README.md");

  fs.writeFileSync(docsPath, content);
  console.log("💾 Documentation saved to:", docsPath);
}

async function main() {
  try {
    console.log("🔄 Generating documentation...");
    
    const content = await generateDocs();
    await saveDocs(content);
    
    console.log("✅ Documentation generated successfully!");
    console.log("\n🎯 Generated:");
    console.log("  - Complete README.md");
    console.log("  - API reference");
    console.log("  - Usage examples");
    console.log("  - Event documentation");
    console.log("  - Development guide");
    
  } catch (error: any) {
    console.error("❌ Generation failed:", error.message);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exitCode = 1;
});
