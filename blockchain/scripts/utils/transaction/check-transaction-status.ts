import { ethers } from "hardhat";
import hre from "hardhat";

async function getAddressFromArgs(): Promise<string | null> {
  return process.argv.find(arg => arg.startsWith('--address='))?.split('=')[1] || null;
}

async function checkTransactionStatus(address: string) {
  const currentNonce = await ethers.provider.getTransactionCount(address, "latest");
  const pendingNonce = await ethers.provider.getTransactionCount(address, "pending");
  const stuckCount = pendingNonce - currentNonce;
  
  console.log("📊 Transaction Status:");
  console.log(`  Current nonce: ${currentNonce}`);
  console.log(`  Pending nonce: ${pendingNonce}`);
  console.log(`  Stuck transactions: ${stuckCount}`);
  
  if (stuckCount > 0) {
    console.log(`\n⚠️ ${stuckCount} stuck transactions detected!`);
    console.log("💡 Solutions:");
    console.log("  1. Wait for network to process them");
    console.log("  2. Cancel with higher gas price");
    console.log("  3. Use different account");
  } else {
    console.log("\n✅ No stuck transactions");
  }
}

async function checkBalance(address: string) {
  const balance = await ethers.provider.getBalance(address);
  console.log(`\n💰 Balance: ${ethers.formatEther(balance)} ETH`);
  
  if (balance < ethers.parseEther("0.01")) {
    console.log("⚠️ Low balance for gas fees");
  }
}

async function checkGasInfo() {
  const feeData = await ethers.provider.getFeeData();
  console.log("\n⛽ Gas Information:");
  
  if (feeData.gasPrice) {
    console.log(`  Gas Price: ${ethers.formatUnits(feeData.gasPrice, "gwei")} gwei`);
  }
  
  if (feeData.maxFeePerGas) {
    console.log(`  Max Fee: ${ethers.formatUnits(feeData.maxFeePerGas, "gwei")} gwei`);
  }
}

async function main() {
  try {
    const customAddress = await getAddressFromArgs();
    const [deployer] = await ethers.getSigners();
    const address = customAddress || deployer.address;
    
    console.log("🔍 Checking transaction status...");
    console.log("🌐 Network:", hre.network.name);
    console.log("👤 Address:", address);
    
    await checkTransactionStatus(address);
    await checkBalance(address);
    await checkGasInfo();
    
  } catch (error: any) {
    console.error("❌ Check failed:", error.message);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exitCode = 1;
});
