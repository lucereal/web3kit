import { ethers } from "hardhat";
import hre from "hardhat";
import { AccessContract } from "../../typechain-types";
import { AddressManager } from "../utils/address-manager";

async function getEnvironmentFromArgs(): Promise<string> {
  return process.argv.find(arg => arg.startsWith('--env='))?.split('=')[1] || 'dev';
}

async function getResourceIdFromArgs(): Promise<number> {
  const resourceArg = process.argv.find(arg => arg.startsWith('--resource='))?.split('=')[1];
  return resourceArg ? parseInt(resourceArg) : 0;
}

async function checkOwnership(accessContract: AccessContract, deployer: any): Promise<boolean> {
  const contractOwner = await accessContract.owner();
  console.log(`Contract owner: ${contractOwner}`);
  
  if (contractOwner.toLowerCase() !== deployer.address.toLowerCase()) {
    console.log("❌ You are not the contract owner. Admin operations require owner privileges.");
    return false;
  }
  
  console.log("✅ Confirmed: You are the contract owner");
  return true;
}

async function deactivateResource(accessContract: AccessContract, deployer: any, resourceId: number) {
  const resource = await accessContract.getResource(resourceId);
  
  console.log("📋 Resource to deactivate:");
  console.log(`  Name: ${resource.name}`);
  console.log(`  Owner: ${resource.owner}`);
  console.log(`  Price: ${ethers.formatEther(resource.price)} ETH`);
  console.log(`  Active: ${resource.isActive ? '✅ Yes' : '❌ No'}`);
  
  if (!resource.isActive) {
    console.log("ℹ️ Resource is already deactivated");
    return;
  }
  
  console.log(`\n🚨 Emergency deactivating resource ${resourceId}...`);
  
  const tx = await accessContract.connect(deployer).emergencyDeactivateResource(resourceId);
  
  console.log("⏳ Waiting for confirmation...");
  console.log(`  Transaction hash: ${tx.hash}`);
  
  const receipt = await tx.wait();
  console.log("✅ Resource deactivated successfully!");
  console.log(`  Gas used: ${receipt?.gasUsed.toString()}`);
}

async function main() {
  try {
    const environment = await getEnvironmentFromArgs();
    const resourceId = await getResourceIdFromArgs();
    const [deployer] = await ethers.getSigners();
    
    console.log("👑 Running admin operations...");
    console.log("🌍 Environment:", environment);
    console.log("🌐 Network:", hre.network.name);
    console.log("👤 Admin:", deployer.address);
    console.log("📋 Target resource ID:", resourceId);
    
    const contractAddress = AddressManager.getProxy(hre.network.name, environment);
    console.log("� Contract:", contractAddress);
    
    const accessContract = await ethers.getContractAt("AccessContract", contractAddress) as AccessContract;
    
    const isOwner = await checkOwnership(accessContract, deployer);
    if (!isOwner) {
      return;
    }
    
    await deactivateResource(accessContract, deployer, resourceId);
    
  } catch (error: any) {
    console.error("❌ Admin operation failed:", error.message);
    
    if (error.message.includes("Resource does not exist")) {
      console.log("� Use --resource=ID to specify a valid resource");
      console.log("� Run list-resources.ts to see available resources");
    } else if (error.message.includes("Ownable: caller is not the owner")) {
      console.log("� Only the contract owner can perform admin operations");
    }
    
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exitCode = 1;
});
