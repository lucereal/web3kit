import { ethers } from "hardhat";
import hre from "hardhat";
import { AccessContract } from "../../typechain-types";
import { AddressManager } from "../utils/address-manager";

async function getEnvironmentFromArgs(): Promise<string> {
  return process.argv.find(arg => arg.startsWith('--env='))?.split('=')[1] || 'dev';
}

async function checkEarnings(accessContract: AccessContract, address: string) {
  const sellerBalance = await accessContract.sellerBalances(address);
  console.log(`💰 Available earnings: ${ethers.formatEther(sellerBalance)} ETH`);
  return sellerBalance;
}

async function withdrawEarnings(accessContract: AccessContract, deployer: any, balance: bigint) {
  const walletBalanceBefore = await ethers.provider.getBalance(deployer.address);
  
  console.log(`\n🚀 Withdrawing ${ethers.formatEther(balance)} ETH...`);
  
  const withdrawTx = await accessContract.connect(deployer).withdraw();
  
  console.log("⏳ Waiting for confirmation...");
  console.log(`  Transaction hash: ${withdrawTx.hash}`);
  
  const receipt = await withdrawTx.wait();
  console.log("✅ Withdrawal successful!");
  console.log(`  Gas used: ${receipt?.gasUsed.toString()}`);
  
  const walletBalanceAfter = await ethers.provider.getBalance(deployer.address);
  const netGain = walletBalanceAfter - walletBalanceBefore;
  console.log(`  Net gain (after gas): ${ethers.formatEther(netGain)} ETH`);
}

async function main() {
  try {
    const environment = await getEnvironmentFromArgs();
    const [deployer] = await ethers.getSigners();
    
    console.log("� Withdrawing seller earnings...");
    console.log("🌍 Environment:", environment);
    console.log("🌐 Network:", hre.network.name);
    console.log("👤 Seller:", deployer.address);
    
    const contractAddress = AddressManager.getProxy(hre.network.name, environment);
    console.log("🔗 Contract:", contractAddress);
    
    const accessContract = await ethers.getContractAt("AccessContract", contractAddress) as AccessContract;
    
    const balance = await checkEarnings(accessContract, deployer.address);
    
    if (balance === 0n) {
      console.log("ℹ️ No earnings to withdraw");
      return;
    }
    
    await withdrawEarnings(accessContract, deployer, balance);
    
  } catch (error: any) {
    console.error("❌ Withdrawal failed:", error.message);
    
    if (error.message.includes("Nothing to withdraw")) {
      console.log("� No earnings available to withdraw");
    }
    
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exitCode = 1;
});
