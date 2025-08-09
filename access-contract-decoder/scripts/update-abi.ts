import * as fs from "fs";
import * as path from "path";


async function getSourceFromArgs(): Promise<string> {
  return process.argv.find(arg => arg.startsWith('--source='))?.split('=')[1] || 'artifacts';
}

async function getNetworkFromArgs(): Promise<string> {
  return process.argv.find(arg => arg.startsWith('--network='))?.split('=')[1] || 'localhost';
}

async function getEnvironmentFromArgs(): Promise<string> {
  return process.argv.find(arg => arg.startsWith('--env='))?.split('=')[1] || 'dev';
}

async function updateFromArtifacts() {
  const artifactPath = path.join(process.cwd(), "..", "blockchain", "artifacts", "contracts", "AccessContract.sol", "AccessContract.json");
  
  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Artifact not found: ${artifactPath}`);
  }
  
  console.log("📁 Reading artifact from:", artifactPath);
  
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const abi = artifact.abi;
  
  if (!abi || !Array.isArray(abi)) {
    throw new Error("Invalid ABI in artifact file");
  }
  
  const abiDir = path.join(process.cwd(), "src", "abi");
  const abiPath = path.join(abiDir, "AccessContract.json");
  
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
    console.log("📁 Created directory:", abiDir);
  }
  
  fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));
  console.log("💾 ABI saved to:", abiPath);
  console.log(`✅ Found ${abi.length} ABI entries`);
  
  return abi;
}

async function updateFromBlockchain(network: string, environment: string) {
  console.log("🔗 Blockchain source not yet implemented");
  console.log(`  Network: ${network}`);
  console.log(`  Environment: ${environment}`);
  console.log("💡 Use --source=artifacts for now");
  process.exit(1);
}

async function main() {
  try {
    const source = await getSourceFromArgs();
    const network = await getNetworkFromArgs();
    const environment = await getEnvironmentFromArgs();
    
    console.log("🔄 Updating ABI from source...");
    console.log("📋 Source:", source);
    
    let abi;
    
    if (source === 'artifacts') {
      abi = await updateFromArtifacts();
    } else if (source === 'blockchain') {
      await updateFromBlockchain(network, environment);
    } else {
      throw new Error(`Unknown source: ${source}. Use 'artifacts' or 'blockchain'`);
    }
    
    console.log("\n🎯 Next steps:");
    console.log("  Run generate-types.ts to update TypeScript types");
    console.log("  Run generate-decoders.ts to update event decoders");
    
  } catch (error: any) {
    console.error("❌ Update failed:", error.message);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exitCode = 1;
});
