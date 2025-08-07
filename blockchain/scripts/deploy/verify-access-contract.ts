import { ethers, upgrades } from "hardhat";
import hre from "hardhat";
import { AddressManager } from "../utils/address-manager";

async function getEnvironmentFromArgs(): Promise<string> {
  return process.argv.find(arg => arg.startsWith('--env='))?.split('=')[1] || 'dev';
}

async function loadAddresses(environment: string) {
  const networkName = hre.network.name;
  
  console.log(`🔍 Verifying deployed contract on network: ${networkName}`);
  console.log(`🌍 Environment: ${environment}`);
  
  if (!AddressManager.exists(networkName, environment)) {
    throw new Error(`No deployment found for network '${networkName}' in environment '${environment}'`);
  }
  
  const addresses = AddressManager.getAll(networkName, environment);
  
  console.log("📋 Found deployed addresses:");
  console.log(`  Network: ${addresses.network}`);
  console.log(`  Environment: ${addresses.environment}`);
  console.log(`  Proxy: ${addresses.proxy}`);
  console.log(`  Implementation: ${addresses.implementation}`);
  console.log(`  Admin: ${addresses.admin}`);
  console.log(`  Deployed: ${addresses.deployedAt}`);
  
  return addresses;
}

async function verifyImplementationContract(implementationAddress: string): Promise<void> {
  console.log("🔍 Verifying implementation contract...");
  
  try {
    await hre.run("verify:verify", {
      address: implementationAddress,
      constructorArguments: [],
    });
    console.log("✅ Implementation contract verified successfully!");
  } catch (error: any) {
    console.log("❌ Implementation verification failed:", error.message);
    console.log(`💡 Manual verification command:`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${implementationAddress}`);
  }
}

async function verifyProxyContract(
  proxyAddress: string, 
  implementationAddress: string, 
  adminAddress: string
): Promise<void> {
  console.log("🔍 Verifying proxy contract...");
  
  try {
    await hre.run("verify:verify", {
      address: proxyAddress,
      constructorArguments: [implementationAddress, adminAddress, "0x"], 
    });
    console.log("✅ Proxy contract verified successfully!");
  } catch (error: any) {
    console.log("❌ Proxy verification failed:", error.message);
    console.log("💡 Note: Proxy verification sometimes fails but functionality is not affected");
    console.log(`💡 Manual verification command:`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${proxyAddress} ${implementationAddress} ${adminAddress} "0x"`);
  }
}

async function performVerification(addresses: any) {
  
  if (hre.network.name === "localhost" || hre.network.name === "hardhat") {
    console.log("📍 Deployed to localhost - skipping verification");
    return;
  }

  console.log("\n⏳ Waiting 30 seconds before verification...");
  await new Promise((resolve) => setTimeout(resolve, 30 * 1000));

  console.log("\n🚀 Starting contract verification...");
  
  await verifyImplementationContract(addresses.implementation);
  
  await verifyProxyContract(addresses.proxy, addresses.implementation, addresses.admin);
  
  console.log("\n✅ Verification process completed!");
}

async function main() {
  try {
    const environment = await getEnvironmentFromArgs();
    const addresses = await loadAddresses(environment);
    
    await performVerification(addresses);
    
  } catch (error: any) {
    console.error(`❌ Verification failed:`, error.message);
    
    if (error.message.includes("No deployment found")) {
      console.log("💡 Please deploy the contract first using:");
      console.log(`   npx hardhat run scripts/deploy/deploy-access-contract.ts --network ${hre.network.name} --env=${await getEnvironmentFromArgs()}`);
    }
    
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("❌ Verification failed:", error);
  process.exitCode = 1;
});
