import { ethers } from "hardhat";
import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

const eventSignatures = {
  "ResourceCreated": "ResourceCreated(uint256,address,string,string,string,string,string,uint256,uint256,uint8)",
  "AccessPurchased": "AccessPurchased(uint256,address,uint256,uint256)",
  "Withdrawal": "Withdrawal(address,uint256)"
};

async function getSaveFromArgs(): Promise<boolean> {
  return process.argv.includes('--save');
}

function generateTopicHash(signature: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(signature));
}

function generateAllHashes() {
  const hashes: Record<string, any> = {};
  
  for (const [eventName, signature] of Object.entries(eventSignatures)) {
    hashes[eventName] = {
      signature,
      topicHash: generateTopicHash(signature)
    };
  }
  
  return hashes;
}

async function saveToFile(hashes: Record<string, any>) {
  const generatedDir = path.join(process.cwd(), "blockchain", "generated");
  const filePath = path.join(generatedDir, "event-topic-hashes.json");
  
  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, JSON.stringify(hashes, null, 2));
  console.log(`💾 Saved to: ${filePath}`);
}

async function main() {
  try {
    const shouldSave = await getSaveFromArgs();
    
    console.log("🔍 Generating event topic hashes...");
    console.log("🌐 Network:", hre.network.name);
    console.log("");
    
    const hashes = generateAllHashes();
    console.log("📋 Event Topic Hashes:");
    console.log(JSON.stringify(hashes, null, 2));
    
    if (shouldSave) {
      console.log("");
      await saveToFile(hashes);
    }
    
  } catch (error: any) {
    console.error("❌ Generation failed:", error.message);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exitCode = 1;
});
