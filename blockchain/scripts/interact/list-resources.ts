import { ethers } from "hardhat";
import hre from "hardhat";
import { AccessContract } from "../../typechain-types";
import { AddressManager } from "../utils/address-manager";

async function getEnvironmentFromArgs(): Promise<string> {
  return process.argv.find(arg => arg.startsWith('--env='))?.split('=')[1] || 'dev';
}

async function listAllResources(accessContract: AccessContract) {
  let resourceCount = 0;
  let activeCount = 0;
  
  console.log("📋 Available resources:\n");
  
  for (let i = 0; i < 100; i++) {
    try {
      const resource = await accessContract.getResource(i);
      resourceCount++;
      
      console.log(`  Resource ${i}:`);
      console.log(`    Name: ${resource.name}`);
      console.log(`    Description: ${resource.description}`);
      console.log(`    Price: ${ethers.formatEther(resource.price)} ETH`);
      console.log(`    Owner: ${resource.owner}`);
      console.log(`    Active: ${resource.isActive ? '✅ Yes' : '❌ No'}`);
      console.log("");
      
      if (resource.isActive) {
        activeCount++;
      }
    } catch {
      break;
    }
  }
  
  console.log(`📊 Summary: ${resourceCount} total resources, ${activeCount} active`);
}

async function main() {
  try {
    const environment = await getEnvironmentFromArgs();
    const [deployer] = await ethers.getSigners();
    
    console.log("� Listing all resources...");
    console.log("🌍 Environment:", environment);
    console.log("🌐 Network:", hre.network.name);
    
    const contractAddress = AddressManager.getProxy(hre.network.name, environment);
    console.log("🔗 Contract:", contractAddress);
    console.log("");
    
    const accessContract = await ethers.getContractAt("AccessContract", contractAddress) as AccessContract;
    
    await listAllResources(accessContract);
    
  } catch (error: any) {
    console.error("❌ Listing failed:", error.message);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exitCode = 1;
});
