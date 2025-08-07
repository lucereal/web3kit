import { ethers } from "hardhat";


async function main() {
    const [deployer] = await ethers.getSigners();
// Cancel by sending to SAME nonce (38) with higher gas
const cancelTx = await deployer.sendTransaction({
  to: deployer.address,
  value: 0,
  gasPrice: ethers.parseUnits("10", "gwei"), // Even higher
  gasLimit: 21000,
  nonce: 38  // ← FORCE same nonce as stuck transaction
});

console.log("🚀 Cancel transaction sent:", cancelTx.hash);
const receipt = await cancelTx.wait();
console.log("✅ Stuck transaction replaced!");
}

main().catch((error) => {
console.error("❌ Cancel failed:", error);
process.exitCode = 1;
});
