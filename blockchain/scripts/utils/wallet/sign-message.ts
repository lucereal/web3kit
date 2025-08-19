import { ethers, Wallet } from "ethers";

async function signMessage() {
  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length !== 2) {
    console.error("❌ Usage: npx ts-node scripts/utils/sign-message-metamask.ts <private_key> <nonce>");
    console.error("   Example: npx ts-node scripts/utils/sign-message-metamask.ts 0xabc123... a1b2c3d4e5f6");
    console.error("   Note: Private key should start with 0x");
    process.exit(1);
  }

  const [privateKey, nonce] = args;

  // Validate private key format
  if (!privateKey.startsWith('0x') || privateKey.length !== 66) {
    console.error("❌ Invalid private key format. Must start with 0x and be 64 characters long (66 total)");
    process.exit(1);
  }

  try {
    // Create wallet from private key
    const wallet = new Wallet(privateKey);
    const address = wallet.address;

    // Create the message
    const message = `Login to Web3kit:\nNonce: ${nonce}`;
    
    console.log("📝 Message to sign:");
    console.log(`"${message}"`);
    console.log();
    console.log(`� Wallet address: ${address}`);
    console.log();

    // Sign the message
    console.log("✍️  Signing message...");
    const signature = await wallet.signMessage(message);
    
    console.log("✅ Message signed successfully!");
    console.log();
    console.log("📋 Results:");
    console.log(`Address: ${address}`);
    console.log(`Nonce: ${nonce}`);
    console.log(`Message: "${message}"`);
    console.log(`Signature: ${signature}`);
    console.log();
    console.log("🚀 JSON for backend verification:");
    const result = {
      address: address,
      nonce: nonce,
      message: message,
      signature: signature
    };
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error: any) {
    console.error("❌ Error signing message:", error.message);
    if (error.message.includes('invalid private key')) {
      console.error("💡 Make sure your private key is valid and starts with 0x");
    }
    process.exit(1);
  }
}

// Helper function to generate a test private key (for development only)
function generateTestWallet() {
  const wallet = Wallet.createRandom();
  console.log("🧪 Generated test wallet:");
  console.log(`Private Key: ${wallet.privateKey}`);
  console.log(`Address: ${wallet.address}`);
  console.log();
  console.log("⚠️  WARNING: This is for testing only! Never use generated keys in production!");
  return wallet;
}

// Main execution
if (require.main === module) {
  // Check if user wants to generate a test wallet
  if (process.argv[2] === '--generate-test-wallet' || process.argv[2] === '-g') {
    generateTestWallet();
  } else {
    signMessage().catch(console.error);
  }
}
