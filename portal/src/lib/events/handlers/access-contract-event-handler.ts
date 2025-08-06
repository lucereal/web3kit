import { 
  AccessPurchasedEvent,
  ResourceCreatedEvent,
  WithdrawalEvent,
  ResourceUpdatedEvent,
  ResourceDeactivatedEvent,
  ResourceDeletedEvent,
} from 'noo1-openr-contract-types';
import { EventMetadata } from "../types/blockchain-events";
import { AccessService } from "../../services/access-service";

/**
 * Handles the AccessPurchased event by granting access to a resource.
 * Uses AccessService to properly manage access with both cache and database.
 */
export async function handleAccessPurchased(
  data: AccessPurchasedEvent.OutputObject, 
  metadata: EventMetadata
): Promise<void> {
  console.log(`💰 Access purchased for resource ${data.resourceId}`);
  
  try {
    // Initialize AccessService
    const accessService = AccessService.create();

    // Extract data from the decoded event
    const resourceId = data.resourceId.toString();
    const buyerWallet = data.buyer.toLowerCase(); // Normalize address
    const usageLimit = Number(data.usageLimit); // Convert BigInt to number
    const expiresAt = Number(data.expiresAt); // Convert BigInt to number
    const amountPaid = data.amountPaid.toString(); // Keep as string for wei precision
    
    console.log(`   Resource ID: ${resourceId}`);
    console.log(`   Buyer: ${buyerWallet}`);
    console.log(`   Usage Limit: ${usageLimit}`);
    console.log(`   Expires At: ${new Date(expiresAt * 1000).toISOString()}`);
    console.log(`   Amount Paid: ${(Number(amountPaid) / 1e18).toFixed(6)} ETH`);
    console.log(`   Transaction: ${metadata.transactionHash}`);
    
    // Grant access using AccessService
    const access = await accessService.grantAccess(
      resourceId,
      buyerWallet,
      usageLimit,
      expiresAt
    );
    
    console.log(`✅ Access granted successfully: ${access.id}`);
    console.log(`   Database ID: ${access.id}`);
    console.log(`   Final Usage Limit: ${access.usage_limit}`);
    console.log(`   Final Expires At: ${new Date(access.expires_at * 1000).toISOString()}`);
    
  } catch (error) {
    console.error(`❌ Failed to handle AccessPurchased event:`, error);
    throw error;
  }
}

/**
 * Handles the ResourceCreated event when a new resource is published on the platform.
 * Uses AccessService to create the resource in both cache and database.
 */
export async function handleResourceCreated(
  data: ResourceCreatedEvent.OutputObject, 
  metadata: EventMetadata
): Promise<void> {
  console.log(`📝 New resource created: ${data.name}`);
  
  try {
    // Initialize AccessService
    const accessService = AccessService.create();
    
    // Extract data from the decoded event
    const resourceId = data.resourceId.toString();
    const ownerWallet = data.owner.toLowerCase(); // Normalize address
    const name = data.name;
    const description = data.description;
    const priceWei = data.price.toString(); // Keep as string for wei precision
    const serviceId = data.serviceId;
    const resourceType = Number(data.resourceType); // Convert BigInt to number
    const cid = data.cid;
    const url = data.url;
    const usageLimit = Number(data.usageLimit); // Convert BigInt to number
    const usageDuration = Number(data.usageDuration); // Convert BigInt to number
    
    console.log(`   Resource ID: ${resourceId}`);
    console.log(`   Owner: ${ownerWallet}`);
    console.log(`   Name: ${name}`);
    console.log(`   Description: ${description}`);
    console.log(`   Price: ${(Number(priceWei) / 1e18).toFixed(6)} ETH`);
    console.log(`   Service ID: ${serviceId}`);
    console.log(`   Resource Type: ${resourceType}`);
    console.log(`   CID: ${cid}`);
    console.log(`   URL: ${url}`);
    console.log(`   Usage Limit: ${usageLimit}`);
    console.log(`   Usage Duration: ${usageDuration} seconds`);
    console.log(`   Transaction: ${metadata.transactionHash}`);
    
    // Create resource using AccessService
    const resource = await accessService.createResource(
      resourceId,
      ownerWallet,
      name,
      description,
      priceWei,
      serviceId,
      resourceType,
      cid,
      url,
      usageLimit,
      usageDuration
    );
    
    console.log(`✅ Resource created successfully: ${resource.id}`);
    console.log(`   Database ID: ${resource.id}`);
    console.log(`   Active: ${resource.is_active}`);
    console.log(`   Created At: ${resource.created_at ? new Date(resource.created_at * 1000).toISOString() : 'N/A'}`);
    
  } catch (error) {
    console.error(`❌ Failed to handle ResourceCreated event:`, error);
    throw error;
  }
}

/**
 * Handles the Withdrawal event when a seller withdraws their earnings from resource sales.
 * This event is triggered when accumulated funds are transferred to the seller's wallet.
 */
export async function handleWithdrawal(
  data: WithdrawalEvent.OutputObject, 
  metadata: EventMetadata
): Promise<void> {
  console.log(`💸 Withdrawal processed`);
  
  // Log detailed event information
  console.log(`   Event: Withdrawal`);
  console.log(`   Transaction: ${metadata.transactionHash}`);
  console.log(`   Block: ${metadata.blockNumber}`);
  console.log(`   Decoded Properties:`);
  console.log(`     seller: ${data.seller} (from topics[1])`);
  console.log(`     amount: ${data.amount} (from data)`);
  console.log(`     amount (ETH): ${(Number(data.amount) / 1e18).toFixed(6)} ETH`);
  
  // TODO: Implement your business logic here:
  // - Update seller's balance
  // - Log withdrawal for accounting
  // - Send confirmation notification
  // - Update analytics
}


/**
 * Handles unknown or unrecognized blockchain events for debugging and monitoring.
 * Logs the event details for investigation and potential future implementation.
 */
export async function handleUnknownEvent(
  eventType: string,
  eventData: any,
  metadata: EventMetadata
): Promise<void> {
  console.log(`❓ Unknown event type: ${eventType}`);
  
  // Log detailed event information
  console.log(`   Event: ${eventType} (unrecognized)`);
  console.log(`   Transaction: ${metadata.transactionHash}`);
  console.log(`   Block: ${metadata.blockNumber}`);
  console.log(`   Raw Event Data:`, JSON.stringify(eventData, null, 2));
  console.log(`   Metadata:`, JSON.stringify(metadata, null, 2));
  
  // TODO: Implement fallback logic:
  // - Log unknown events for investigation
  // - Send alerts to development team
  // - Store raw data for later processing
}