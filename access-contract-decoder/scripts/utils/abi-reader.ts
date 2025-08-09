import * as fs from "fs";
import * as path from "path";

export interface ContractArtifact {
  abi: any[];
  contractName?: string;
  sourceName?: string;
  compiler?: {
    version: string;
  };
}

export interface ABIData {
  abi: any[];
  artifact: ContractArtifact;
}

/**
 * Read and parse the AccessContract ABI from the artifacts
 * Handles both raw ABI arrays and Hardhat artifacts
 */
export async function readABI(): Promise<ABIData> {
  const abiPath = path.join(process.cwd(), "src", "abi", "AccessContract.json");
  
  if (!fs.existsSync(abiPath)) {
    throw new Error(`ABI not found: ${abiPath}. Run update-from-blockchain.ts first.`);
  }
  
  const artifact: ContractArtifact = JSON.parse(fs.readFileSync(abiPath, "utf8"));
  
  // Handle both raw ABI arrays and Hardhat artifacts
  const abi = Array.isArray(artifact) ? artifact : artifact.abi;
  
  if (!abi || !Array.isArray(abi)) {
    throw new Error("Invalid ABI format in artifact file");
  }
  
  console.log(`📁 Read ABI with ${abi.length} entries`);
  console.log(`📝 Contract: ${artifact.contractName || 'AccessContract'}`);
  
  return { abi, artifact };
}

/**
 * Get the raw ABI array only (for backward compatibility)
 */
export async function readABIOnly(): Promise<any[]> {
  const { abi } = await readABI();
  return abi;
}
