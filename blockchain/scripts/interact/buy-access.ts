import { ethers } from "hardhat";
import hre from "hardhat";
import { AccessContract } from "../../typechain-types";
import { AddressManager } from "../utils/address-manager";

async function getEnvironmentFromArgs(): Promise<string> {
  return process.argv.find(arg => arg.startsWith('--env='))?.split('=')[1] || 'dev';
}

async function getResourceIdFromArgs(): Promise<number> {
  const resourceArg = process.argv.find(arg => arg.startsWith('--resource='))?.split('=')[1];
  return resourceArg ? parseInt(resourceArg) : 0; // Default to resource ID 0
}

async function getResourceDetails(accessContract: AccessContract, resourceId: number) {
  try {
    const resource = await accessContract.getResource(resourceId);
    
    if (!resource.isActive) {
      throw new Error("Resource is not active");
    }
    
    console.log("📋 Resource details:");
    console.log(`  Owner: ${resource.owner}`);
    console.log(`  Name: ${resource.name}`);
    console.log(`  Description: ${resource.description}`);
    console.log(`  Price: ${ethers.formatEther(resource.price)} ETH`);
    console.log(`  Active: ${resource.isActive}`);
    
    return resource;
  } catch (error: any) {
    if (error.message.includes("Resource does not exist")) {
      throw new Error(`Resource ID ${resourceId} does not exist`);
    }
    throw error;
  }
}

async function purchaseAccess(accessContract: AccessContract, deployer: any, resourceId: number, price: bigint) {
  console.log(`\n🚀 Purchasing access for ${ethers.formatEther(price)} ETH...`);
  
  const buyTx = await accessContract.connect(deployer).buyAccess(resourceId, {
    value: price
  });
  
  console.log("⏳ Waiting for confirmation...");
  console.log(`  Transaction hash: ${buyTx.hash}`);
  
  const receipt = await buyTx.wait();
  console.log("✅ Access purchased successfully!");
  console.log(`  Gas used: ${receipt?.gasUsed.toString()}`);
  
  const hasAccess = await accessContract.hasAccess(deployer.address, resourceId);
  console.log(`  Has access: ${hasAccess ? '✅ Yes' : '❌ No'}`);
}

async function main() {
  try {
    // Get parameters
    const environment = await getEnvironmentFromArgs();
    const resourceId = await getResourceIdFromArgs();
    const [deployer] = await ethers.getSigners();
    
    console.log("� Buying access to resource...");
    console.log("🌍 Environment:", environment);
    console.log("🌐 Network:", hre.network.name);
    console.log("👤 Buyer:", deployer.address);
    console.log("📋 Resource ID:", resourceId);
    
    const contractAddress = AddressManager.getProxy(hre.network.name, environment);
    console.log("🔗 Contract:", contractAddress);
    
    const accessContract = await ethers.getContractAt("AccessContract", contractAddress) as AccessContract;
    
    const resource = await getResourceDetails(accessContract, resourceId);
    
    const hasAccess = await accessContract.hasAccess(deployer.address, resourceId);
    if (hasAccess) {
      console.log("ℹ️ You already have access to this resource");
      console.log("  Proceeding to purchase anyway (will extend access)...");
    }
    
    await purchaseAccess(accessContract, deployer, resourceId, resource.price);
    
  } catch (error: any) {
    console.error("❌ Purchase failed:", error.message);
    
    if (error.message.includes("Resource does not exist")) {
      console.log("� Use --resource=ID to specify a resource");
      console.log("� Run list-resources.ts to see available resources");
    }
    
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exitCode = 1;
});
