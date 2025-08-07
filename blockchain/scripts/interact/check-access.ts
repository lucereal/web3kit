import { ethers } from "hardhat";
import hre from "hardhat";
import { AccessContract } from "../../typechain-types";
import { AddressManager } from "../utils/address-manager";

async function getEnvironmentFromArgs(): Promise<string> {
  return process.argv.find(arg => arg.startsWith('--env='))?.split('=')[1] || 'dev';
}

async function getResourceIdFromArgs(): Promise<number | null> {
  const resourceArg = process.argv.find(arg => arg.startsWith('--resource='))?.split('=')[1];
  return resourceArg ? parseInt(resourceArg) : null;
}

async function checkSpecificResource(accessContract: AccessContract, deployer: any, resourceId: number) {
  console.log(`📋 Resource ID: ${resourceId}`);
  
  const resource = await accessContract.getResource(resourceId);
  const hasAccess = await accessContract.hasAccess(deployer.address, resourceId);
  
  console.log(`  Name: ${resource.name}`);
  console.log(`  Description: ${resource.description}`);
  console.log(`  Price: ${ethers.formatEther(resource.price)} ETH`);
  console.log(`  Active: ${resource.isActive ? '✅ Yes' : '❌ No'}`);
  console.log(`  Access: ${hasAccess ? '✅ Yes' : '❌ No'}`);
  
  if (hasAccess && resource.owner.toLowerCase() !== deployer.address.toLowerCase()) {
    const access = await accessContract.buyerAccess(deployer.address, resourceId);
    console.log(`  Amount paid: ${ethers.formatEther(access.amountPaid)} ETH`);
  }
}

async function checkAllResources(accessContract: AccessContract, deployer: any) {
  let resourceCount = 0;
  let accessCount = 0;
  
  for (let i = 0; i < 100; i++) {
    try {
      await accessContract.getResource(i);
      resourceCount++;
      
      const hasAccess = await accessContract.hasAccess(deployer.address, i);
      if (hasAccess) {
        accessCount++;
        console.log(`\n  Resource ${i}: ✅ Access granted`);
        
        const resource = await accessContract.getResource(i);
        console.log(`    Name: ${resource.name}`);
        console.log(`    Price: ${ethers.formatEther(resource.price)} ETH`);
      }
    } catch {
      break;
    }
  }
  
  console.log(`📋 Total resources: ${resourceCount}`);
  console.log(`✅ You have access to ${accessCount} resources`);
}

async function main() {
  try {
    const environment = await getEnvironmentFromArgs();
    const resourceId = await getResourceIdFromArgs();
    const [deployer] = await ethers.getSigners();
    
    console.log("� Checking access to resources...");
    console.log("🌍 Environment:", environment);
    console.log("🌐 Network:", hre.network.name);
    console.log("� User:", deployer.address);
    
    const contractAddress = AddressManager.getProxy(hre.network.name, environment);
    console.log("� Contract:", contractAddress);
    
    const accessContract = await ethers.getContractAt("AccessContract", contractAddress) as AccessContract;
    
    if (resourceId !== null) {
      await checkSpecificResource(accessContract, deployer, resourceId);
    } else {
      await checkAllResources(accessContract, deployer);
    }
    
    const sellerBalance = await accessContract.sellerBalances(deployer.address);
    if (sellerBalance > 0n) {
      console.log(`\n💰 Seller earnings available: ${ethers.formatEther(sellerBalance)} ETH`);
    }
    
  } catch (error: any) {
    console.error("❌ Check failed:", error.message);
    
    if (error.message.includes("Resource does not exist")) {
      console.log("💡 Use --resource=ID to specify a resource");
      console.log("� Run list-resources.ts to see available resources");
    }
    
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exitCode = 1;
});
