import { ethers, upgrades } from "hardhat";
import hre from "hardhat";
import { AddressManager } from "../utils/address-manager";

// Helper functions
async function getEnvironmentFromArgs(): Promise<string> {
  return process.argv.find(arg => arg.startsWith('--env='))?.split('=')[1] || 'dev';
}

async function logDeployerInfo() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  
  console.log("🔄 Upgrading AccessContract...");
  console.log("👤 Deployer address:", deployer.address);
  console.log("💰 Deployer balance:", ethers.formatEther(balance), "ETH");
  console.log("🌐 Network:", hre.network.name);
  
  return deployer;
}

async function checkPendingTransactions(deployer: any) {
  const currentNonce = await ethers.provider.getTransactionCount(deployer.address, "latest");
  const pendingNonce = await ethers.provider.getTransactionCount(deployer.address, "pending");
  
  console.log("🔢 Current nonce:", currentNonce);
  console.log("⏳ Pending nonce:", pendingNonce);
  
  if (pendingNonce > currentNonce) {
    console.log("⚠️  Warning: You have pending transactions. This might cause issues.");
    console.log("💡 Consider waiting for pending transactions to complete or increase gas price.");
  }
}

async function validateProxyContract(proxyAddress: string) {
  console.log("📄 Current proxy address:", proxyAddress);
  
  const proxyCode = await ethers.provider.getCode(proxyAddress);
  if (proxyCode === "0x") {
    throw new Error(`No contract found at proxy address ${proxyAddress} on ${hre.network.name}`);
  }
  console.log("✅ Proxy contract found on network");
  
  const currentImplementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("🔧 Current implementation:", currentImplementationAddress);
  
  return currentImplementationAddress;
}

async function performUpgrade(proxyAddress: string) {
  const AccessContract = await ethers.getContractFactory("AccessContract");
  
  console.log("\n📦 Preparing upgrade...");
  console.log("🔍 Validating upgrade compatibility...");
  
  await upgrades.validateUpgrade(proxyAddress, AccessContract);
  console.log("✅ Upgrade validation passed!");
  
  console.log("🔄 Upgrading implementation...");
  console.log("⏳ Submitting upgrade transaction...");
  
  const upgradeTx = await upgrades.upgradeProxy(proxyAddress, AccessContract);
  
  const deploymentTx = upgradeTx.deploymentTransaction();
  if (deploymentTx) {
    console.log("📝 Upgrade transaction submitted!");
    console.log("🔗 Transaction hash:", deploymentTx.hash);
    console.log("⏳ Waiting for transaction confirmation...");
    
    const receipt = await deploymentTx.wait();
    console.log("✅ Transaction confirmed in block:", receipt?.blockNumber);
    console.log("⛽ Gas used:", receipt?.gasUsed.toString());
  }
  
  await upgradeTx.waitForDeployment();
  console.log("✅ AccessContract upgraded successfully!");
  
  return upgradeTx;
}

async function verifyUpgrade(proxyAddress: string) {
  console.log("\n🔍 Retrieving updated contract addresses...");
  
  const newImplementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress);
  
  if (!newImplementationAddress || newImplementationAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error("Failed to retrieve new implementation address");
  }
  
  if (!adminAddress || adminAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error("Failed to retrieve admin address");
  }
  
  console.log("🔧 New implementation address:", newImplementationAddress);
  console.log("👑 ProxyAdmin address:", adminAddress);
  
  // Quick contract verification
  const upgradedContract = await ethers.getContractAt("AccessContract", proxyAddress);
  const owner = await upgradedContract.owner();
  const version = await upgradedContract.VERSION();
  const nextResourceId = await upgradedContract.nextResourceId();
  
  console.log("\n📋 Contract Verification:");
  console.log("  Owner:", owner);
  console.log("  Version:", version);
  console.log("  Next Resource ID:", nextResourceId.toString());
  
  return { newImplementationAddress, adminAddress };
}

async function printSummary(proxyAddress: string, oldImplementation: string, newImplementation: string, adminAddress: string) {
  console.log("\n📝 Important Addresses:");
  console.log("🌟 PROXY (unchanged):", proxyAddress);
  console.log("🔧 OLD Implementation:", oldImplementation);
  console.log("🔧 NEW Implementation:", newImplementation);
  console.log("👑 Admin:", adminAddress);
  
  console.log("\n🎉 Upgrade completed successfully!");
  console.log("💡 The proxy address remains the same - all your data is preserved!");
  console.log("💡 New functions are now available on the existing proxy!");
}

async function main() {
  try {
    // Get environment and deployer info
    const environment = await getEnvironmentFromArgs();
    const deployer = await logDeployerInfo();
    console.log("🌍 Environment:", environment);
    
    // Check for pending transactions
    await checkPendingTransactions(deployer);
    
    // Get existing proxy address
    const proxyAddress = AddressManager.getProxy(hre.network.name, environment);
    
    // Validate proxy contract
    const currentImplementationAddress = await validateProxyContract(proxyAddress);
    
    // Perform the upgrade
    await performUpgrade(proxyAddress);
    
    // Verify upgrade and get new addresses
    const { newImplementationAddress, adminAddress } = await verifyUpgrade(proxyAddress);
    
    // Save updated addresses
    console.log("\n💾 Saving updated addresses...");
    AddressManager.save(
      proxyAddress,
      newImplementationAddress,
      adminAddress,
      deployer.address,
      hre.network.name,
      environment
    );
    console.log("✅ Updated addresses saved!");
    
    // Print summary
    await printSummary(proxyAddress, currentImplementationAddress, newImplementationAddress, adminAddress);
    
  } catch (error: any) {
    console.error("❌ Upgrade failed:", error.message);
    
    if (error.message.includes("upgrade is not supported")) {
      console.log("\n💡 Possible solutions:");
      console.log("   - Check if you added new storage variables in the wrong place");
      console.log("   - Ensure you're only adding new functions or appending new storage");
      console.log("   - Review OpenZeppelin upgrade guidelines");
    } else if (error.message.includes("No contract found")) {
      console.log("\n💡 Make sure the contract is deployed first:");
      console.log("   npx hardhat run scripts/deploy/deploy-access-contract.ts --network", hre.network.name, "--env=" + (await getEnvironmentFromArgs()));
    }
    
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("❌ Upgrade script failed:", error);
  process.exitCode = 1;
});
