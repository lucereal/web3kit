import { ethers } from "hardhat";
import hre from "hardhat";
import { AccessContract } from "../../typechain-types";
import { AddressManager } from "../utils/address-manager";

async function getEnvironmentFromArgs(): Promise<string> {
  return process.argv.find(arg => arg.startsWith('--env='))?.split('=')[1] || 'dev';
}

async function getResourceParams() {
  const name = process.argv.find(arg => arg.startsWith('--name='))?.split('=')[1] || "Sample Resource";
  const description = process.argv.find(arg => arg.startsWith('--description='))?.split('=')[1] || "A sample access-controlled resource";
  const priceArg = process.argv.find(arg => arg.startsWith('--price='))?.split('=')[1];
  const resourcePrice = priceArg ? ethers.parseEther(priceArg) : ethers.parseEther("0.001");
  
  return { name, description, resourcePrice };
}

async function createResource(accessContract: AccessContract, deployer: any, name: string, description: string, resourcePrice: bigint) {
  console.log("📝 Resource details:");
  console.log(`  Name: ${name}`);
  console.log(`  Description: ${description}`);
  console.log(`  Price: ${ethers.formatEther(resourcePrice)} ETH`);
  
  console.log("\n🚀 Creating resource...");
  
  const createTx = await accessContract.connect(deployer).createResource(
    name,
    description,
    "",
    "",
    "",
    resourcePrice,
    0
  );
  
  console.log("⏳ Waiting for confirmation...");
  console.log(`  Transaction hash: ${createTx.hash}`);
  
  const receipt = await createTx.wait();
  console.log("✅ Resource created successfully!");
  console.log(`  Gas used: ${receipt?.gasUsed.toString()}`);
  
  let resourceId = 0;
  try {
    for (let i = 0; i < 100; i++) {
      await accessContract.getResource(i);
      resourceId = i;
    }
  } catch {}
  
  console.log(`\n📋 New resource ID: ${resourceId}`);
  return resourceId;
}

async function main() {
  try {
    const environment = await getEnvironmentFromArgs();
    const { name, description, resourcePrice } = await getResourceParams();
    const [deployer] = await ethers.getSigners();
    
    console.log("🆕 Creating new resource...");
    console.log("🌍 Environment:", environment);
    console.log("� Network:", hre.network.name);
    console.log("👤 Creator:", deployer.address);
    
    const contractAddress = AddressManager.getProxy(hre.network.name, environment);
    console.log("� Contract:", contractAddress);
    
    const accessContract = await ethers.getContractAt("AccessContract", contractAddress) as AccessContract;
    
    await createResource(accessContract, deployer, name, description, resourcePrice);
    
  } catch (error: any) {
    console.error("❌ Creation failed:", error.message);
    
    if (error.message.includes("Empty name")) {
      console.log("💡 Use --name='Resource Name' to specify a name");
    }
    
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exitCode = 1;
});
