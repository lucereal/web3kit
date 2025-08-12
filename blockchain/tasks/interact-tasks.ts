import { task } from "hardhat/config";


task("create-resource", "Create a new resource")
  .addParam("name", "The resource name")
  .addParam("description", "The resource description")
  .addParam("price", "The resource price in ETH")
  .addOptionalParam("env", "Environment (dev/staging/prod)", "dev")
  .setAction(async (taskArgs, hre) => {
    const { ethers } = hre;
    const { AddressManager } = await import("../scripts/utils/address-manager");
    
    const { name, description, price, env } = taskArgs;
    const [deployer] = await ethers.getSigners();
    
    console.log("🆕 Creating new resource...");
    console.log("🌍 Environment:", env);
    console.log("🌐 Network:", hre.network.name);
    console.log("👤 Creator:", deployer.address);
    
    const contractAddress = AddressManager.getProxy(hre.network.name, env);
    console.log("📄 Contract:", contractAddress);
    
    const accessContract = await ethers.getContractAt("AccessContract", contractAddress);
    
    const resourcePrice = ethers.parseEther(price);
    
    console.log("📝 Resource details:");
    console.log(`  Name: ${name}`);
    console.log(`  Description: ${description}`);
    console.log(`  Price: ${ethers.formatEther(resourcePrice)} ETH`);
    
    console.log("\n🚀 Creating resource...");
    
    const createTx = await accessContract.connect(deployer).createResource(
      name,
      description,
      "",
      "",
      "",
      resourcePrice,
      0
    );
    
    console.log("⏳ Waiting for confirmation...");
    console.log(`  Transaction hash: ${createTx.hash}`);
    
    const receipt = await createTx.wait();
    console.log("✅ Resource created successfully!");
    console.log(`  Gas used: ${receipt?.gasUsed.toString()}`);
    
    // Find the new resource ID
    let resourceId = 0;
    try {
      for (let i = 0; i < 100; i++) {
        await accessContract.getResource(i);
        resourceId = i;
      }
    } catch {}
    
    console.log(`\n📋 New resource ID: ${resourceId}`);
  });

  
// Buy Access Task
task("buy-access", "Buy access to a resource")
  .addParam("resource", "The resource ID to buy access to")
  .addOptionalParam("env", "Environment (dev/staging/prod)", "dev")
  .setAction(async (taskArgs, hre) => {
    const { ethers } = hre;
    const { AddressManager } = await import("../scripts/utils/address-manager");
    
    const { resource: resourceIdStr, env } = taskArgs;
    const resourceId = parseInt(resourceIdStr);
    const [deployer] = await ethers.getSigners();
    
    console.log("💰 Buying access to resource...");
    console.log("🌍 Environment:", env);
    console.log("🌐 Network:", hre.network.name);
    console.log("👤 Buyer:", deployer.address);
    console.log("📋 Resource ID:", resourceId);
    
    const contractAddress = AddressManager.getProxy(hre.network.name, env);
    console.log("📄 Contract:", contractAddress);
    
    const accessContract = await ethers.getContractAt("AccessContract", contractAddress);
    
    // Get resource details
    const resourceData = await accessContract.getResource(resourceId);
    
    if (!resourceData.isActive) {
      throw new Error("Resource is not active");
    }
    
    console.log("📋 Resource details:");
    console.log(`  Owner: ${resourceData.owner}`);
    console.log(`  Name: ${resourceData.name}`);
    console.log(`  Description: ${resourceData.description}`);
    console.log(`  Price: ${ethers.formatEther(resourceData.price)} ETH`);
    
    // Check if already has access
    const hasAccess = await accessContract.hasAccess(deployer.address, resourceId);
    if (hasAccess) {
      console.log("ℹ️ You already have access to this resource");
      return;
    }
    
    console.log(`\n🚀 Purchasing access for ${ethers.formatEther(resourceData.price)} ETH...`);
    
    const buyTx = await accessContract.connect(deployer).buyAccess(resourceId, {
      value: resourceData.price
    });
    
    console.log("⏳ Waiting for confirmation...");
    console.log(`  Transaction hash: ${buyTx.hash}`);
    
    const receipt = await buyTx.wait();
    console.log("✅ Access purchased successfully!");
    console.log(`  Gas used: ${receipt?.gasUsed.toString()}`);
  });

// Check Access Task
task("check-access", "Check access to resources")
  .addOptionalParam("resource", "Specific resource ID to check (leave empty to check all)")
  .addOptionalParam("env", "Environment (dev/staging/prod)", "dev")
  .setAction(async (taskArgs, hre) => {
    const { ethers } = hre;
    const { AddressManager } = await import("../scripts/utils/address-manager");
    
    const { resource: resourceIdStr, env } = taskArgs;
    const resourceId = resourceIdStr ? parseInt(resourceIdStr) : null;
    const [deployer] = await ethers.getSigners();
    
    console.log("🔍 Checking access...");
    console.log("🌍 Environment:", env);
    console.log("🌐 Network:", hre.network.name);
    console.log("👤 Address:", deployer.address);
    
    const contractAddress = AddressManager.getProxy(hre.network.name, env);
    console.log("📄 Contract:", contractAddress);
    
    const accessContract = await ethers.getContractAt("AccessContract", contractAddress);
    
    if (resourceId !== null) {
      // Check specific resource
      console.log(`📋 Resource ID: ${resourceId}`);
      
      const resource = await accessContract.getResource(resourceId);
      const hasAccess = await accessContract.hasAccess(deployer.address, resourceId);
      
      console.log(`  Name: ${resource.name}`);
      console.log(`  Description: ${resource.description}`);
      console.log(`  Price: ${ethers.formatEther(resource.price)} ETH`);
      console.log(`  Active: ${resource.isActive ? '✅ Yes' : '❌ No'}`);
      console.log(`  Access: ${hasAccess ? '✅ Yes' : '❌ No'}`);
      
      if (hasAccess && resource.owner.toLowerCase() !== deployer.address.toLowerCase()) {
        const access = await accessContract.buyerAccess(deployer.address, resourceId);
        console.log(`  Amount paid: ${ethers.formatEther(access.amountPaid)} ETH`);
      }
    } else {
      // Check all resources
      console.log("📋 Checking all resources...\n");
      
      let foundResources = false;
      for (let i = 0; i < 100; i++) {
        try {
          const resource = await accessContract.getResource(i);
          const hasAccess = await accessContract.hasAccess(deployer.address, i);
          
          foundResources = true;
          console.log(`  Resource ${i}:`);
          console.log(`    Name: ${resource.name}`);
          console.log(`    Price: ${ethers.formatEther(resource.price)} ETH`);
          console.log(`    Active: ${resource.isActive ? '✅ Yes' : '❌ No'}`);
          console.log(`    Access: ${hasAccess ? '✅ Yes' : '❌ No'}`);
          console.log("");
        } catch {
          break;
        }
      }
      
      if (!foundResources) {
        console.log("No resources found");
      }
    }
  });

// List Resources Task
task("list-resources", "List all available resources")
  .addOptionalParam("env", "Environment (dev/staging/prod)", "dev")
  .setAction(async (taskArgs, hre) => {
    const { ethers } = hre;
    const { AddressManager } = await import("../scripts/utils/address-manager");
    
    const { env } = taskArgs;
    
    console.log("📋 Listing resources...");
    console.log("🌍 Environment:", env);
    console.log("🌐 Network:", hre.network.name);
    
    const contractAddress = AddressManager.getProxy(hre.network.name, env);
    console.log("📄 Contract:", contractAddress);
    
    const accessContract = await ethers.getContractAt("AccessContract", contractAddress);
    
    let resourceCount = 0;
    let activeCount = 0;
    
    console.log("📋 Available resources:\n");
    
    for (let i = 0; i < 100; i++) {
      try {
        const resource = await accessContract.getResource(i);
        resourceCount++;
        
        console.log(`  Resource ${i}:`);
        console.log(`    Name: ${resource.name}`);
        console.log(`    Description: ${resource.description}`);
        console.log(`    Price: ${ethers.formatEther(resource.price)} ETH`);
        console.log(`    Owner: ${resource.owner}`);
        console.log(`    Active: ${resource.isActive ? '✅ Yes' : '❌ No'}`);
        console.log("");
        
        if (resource.isActive) {
          activeCount++;
        }
      } catch {
        break;
      }
    }
    
    console.log(`📊 Summary: ${resourceCount} total resources, ${activeCount} active`);
  });

// Withdraw Earnings Task
task("withdraw-earnings", "Withdraw seller earnings")
  .addOptionalParam("env", "Environment (dev/staging/prod)", "dev")
  .setAction(async (taskArgs, hre) => {
    const { ethers } = hre;
    const { AddressManager } = await import("../scripts/utils/address-manager");
    
    const { env } = taskArgs;
    const [deployer] = await ethers.getSigners();
    
    console.log("💰 Withdrawing earnings...");
    console.log("🌍 Environment:", env);
    console.log("🌐 Network:", hre.network.name);
    console.log("👤 Seller:", deployer.address);
    
    const contractAddress = AddressManager.getProxy(hre.network.name, env);
    console.log("📄 Contract:", contractAddress);
    
    const accessContract = await ethers.getContractAt("AccessContract", contractAddress);
    
    // Check earnings
    const sellerBalance = await accessContract.sellerBalances(deployer.address);
    console.log(`💰 Available earnings: ${ethers.formatEther(sellerBalance)} ETH`);
    
    if (sellerBalance === 0n) {
      console.log("No earnings to withdraw");
      return;
    }
    
    const walletBalanceBefore = await ethers.provider.getBalance(deployer.address);
    
    console.log(`\n🚀 Withdrawing ${ethers.formatEther(sellerBalance)} ETH...`);
    
    const withdrawTx = await accessContract.connect(deployer).withdraw();
    
    console.log("⏳ Waiting for confirmation...");
    console.log(`  Transaction hash: ${withdrawTx.hash}`);
    
    const receipt = await withdrawTx.wait();
    console.log("✅ Withdrawal successful!");
    console.log(`  Gas used: ${receipt?.gasUsed.toString()}`);
    
    const walletBalanceAfter = await ethers.provider.getBalance(deployer.address);
    const actualReceived = walletBalanceAfter - walletBalanceBefore + (receipt?.gasUsed || 0n) * (receipt?.gasPrice || 0n);
    
    console.log(`  Received: ${ethers.formatEther(actualReceived)} ETH`);
  });

// Admin Operations Task
task("admin-ops", "Perform admin operations (deactivate resource)")
  .addParam("resource", "The resource ID to operate on")
  .addOptionalParam("env", "Environment (dev/staging/prod)", "dev")
  .setAction(async (taskArgs, hre) => {
    const { ethers } = hre;
    const { AddressManager } = await import("../scripts/utils/address-manager");
    
    const { resource: resourceIdStr, env } = taskArgs;
    const resourceId = parseInt(resourceIdStr);
    const [deployer] = await ethers.getSigners();
    
    console.log("⚙️ Admin operations...");
    console.log("🌍 Environment:", env);
    console.log("🌐 Network:", hre.network.name);
    console.log("👤 Admin:", deployer.address);
    console.log("📋 Resource ID:", resourceId);
    
    const contractAddress = AddressManager.getProxy(hre.network.name, env);
    console.log("📄 Contract:", contractAddress);
    
    const accessContract = await ethers.getContractAt("AccessContract", contractAddress);
    
    // Check ownership
    const contractOwner = await accessContract.owner();
    console.log(`Contract owner: ${contractOwner}`);
    
    if (contractOwner.toLowerCase() !== deployer.address.toLowerCase()) {
      throw new Error("You are not the contract owner. Admin operations require owner privileges.");
    }
    
    console.log("✅ Confirmed: You are the contract owner");
    
    // Get resource details
    const resource = await accessContract.getResource(resourceId);
    
    console.log("📋 Current resource status:");
    console.log(`  Name: ${resource.name}`);
    console.log(`  Owner: ${resource.owner}`);
    console.log(`  Active: ${resource.isActive ? '✅ Yes' : '❌ No'}`);
    
    if (!resource.isActive) {
      console.log("Resource is already inactive");
      return;
    }
    
    console.log("\n🚀 Deactivating resource...");
    
    const deactivateTx = await accessContract.connect(deployer).emergencyDeactivateResource(resourceId);
    
    console.log("⏳ Waiting for confirmation...");
    console.log(`  Transaction hash: ${deactivateTx.hash}`);
    
    const receipt = await deactivateTx.wait();
    console.log("✅ Resource deactivated successfully!");
    console.log(`  Gas used: ${receipt?.gasUsed.toString()}`);
  });
