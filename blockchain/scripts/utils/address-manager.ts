import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import hre from "hardhat";

interface DeployedAddresses {
  proxy: string;
  implementation: string;
  admin: string;
  deployer: string;
  network: string;
  environment: string;
  deployedAt: string;
}

export class AddressManager {
  private static getFilePath(network?: string, environment?: string): string {
    const targetNetwork = network || hre.network.name;
    const targetEnv = environment || "default";
    
    const deploymentsDir = join(process.cwd(), "blockchain", "generated", "deployments", targetEnv);
    
    if (!existsSync(deploymentsDir)) {
      mkdirSync(deploymentsDir, { recursive: true });
    }
    
    return join(deploymentsDir, `${targetNetwork}.json`);
  }

  static save(
    proxy: string,
    implementation: string,
    admin: string,
    deployer: string,
    network: string,
    environment?: string
  ): void {
    const targetEnv = environment || "default";
    
    const addresses: DeployedAddresses = {
      proxy,
      implementation,
      admin,
      deployer,
      network,
      environment: targetEnv,
      deployedAt: new Date().toISOString()
    };

    const filePath = this.getFilePath(network, environment);
    writeFileSync(filePath, JSON.stringify(addresses, null, 2));
    console.log("💾 Addresses saved to:", filePath);
  }

  private static load(network?: string, environment?: string): DeployedAddresses {
    const filePath = this.getFilePath(network, environment);
    
    if (!existsSync(filePath)) {
      const targetNetwork = network || hre.network.name;
      const targetEnv = environment || "default";
      throw new Error(`Deployed addresses file not found for network '${targetNetwork}' in environment '${targetEnv}': ${filePath}`);
    }

    const data = readFileSync(filePath, "utf8");
    return JSON.parse(data);
  }

  static getProxy(network?: string, environment?: string): string {
    return this.load(network, environment).proxy;
  }

  static getImplementation(network?: string, environment?: string): string {
    return this.load(network, environment).implementation;
  }

  static getAdmin(network?: string, environment?: string): string {
    return this.load(network, environment).admin;
  }

  static getAll(network?: string, environment?: string): DeployedAddresses {
    return this.load(network, environment);
  }

  static exists(network?: string, environment?: string): boolean {
    try {
      this.load(network, environment);
      return true;
    } catch {
      return false;
    }
  }
}
