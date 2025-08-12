import { ethers, upgrades } from "hardhat";
import hre from "hardhat";
import { AddressManager as AccessManager } from "../utils/address-manager";

async function main() {
  // Get environment from command line arguments
  const environment = process.argv.find(arg => arg.startsWith('--env='))?.split('=')[1] || 'dev';
  
  const [deployer] = await ethers.getSigners();
  
  console.log("🚀 Deploying upgradeable AccessContract...");
  console.log("🌍 Environment:", environment);
  console.log("🌐 Network:", hre.network.name);
  console.log("👤 Deployer address:", deployer.address);
  console.log("💰 Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  const AccessContract = await ethers.getContractFactory("AccessContract");

  console.log("📦 Deploying contract with proxy...");
  
  // Deploy the upgradeable contract
  // This creates: Implementation contract + Proxy contract + ProxyAdmin contract
  const accessContract = await upgrades.deployProxy(
    AccessContract,
    [], // No constructor args needed (we use initialize())
    { 
      initializer: 'initialize',
      kind: 'transparent' // Use transparent proxy pattern
    }
  );

  await accessContract.waitForDeployment();
  
  const proxyAddress = await accessContract.getAddress();
  console.log("✅ AccessContract (Proxy) deployed to:", proxyAddress);
  
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("🔧 Implementation contract deployed to:", implementationAddress);
  
  const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress);
  console.log("👑 ProxyAdmin deployed to:", adminAddress);

  const owner = await accessContract.owner();
  const version = await accessContract.VERSION();
  const nextResourceId = await accessContract.nextResourceId();
  
  console.log("\n📋 Contract Verification:");
  console.log("  Owner:", owner);
  console.log("  Version:", version);
  console.log("  Next Resource ID:", nextResourceId.toString());

  console.log("\n📝 Important Addresses:");
  console.log("🌟 PROXY (Use this address):", proxyAddress);
  console.log("🔧 Implementation:", implementationAddress);
  console.log("👑 Admin:", adminAddress);
  
  console.log("\n💡 To interact with your contract, always use the PROXY address!");
  console.log("💡 Save these addresses for future upgrades!");

  // Save addresses with environment
  AccessManager.save(proxyAddress, implementationAddress, adminAddress, deployer.address, hre.network.name, environment);

  console.log(`📁 Addresses saved to: deployments/${environment}/${hre.network.name}.json`);


}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
