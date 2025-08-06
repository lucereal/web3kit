
import { handleAccessPurchased, handleResourceCreated, handleWithdrawal, handleUnknownEvent
  } from "./access-contract-event-handler";

import { WebhookLogWithMetadata  } from "../types/webhook-payload";
import { AccessPurchasedEvent, ResourceCreatedEvent, WithdrawalEvent,
  getEventNameFromTopic, decodeEventData, EventMetadata
 } from "../types/blockchain-events";





export async function handleWebhookLog(webhookLog: WebhookLogWithMetadata, metadata: any) {
  // Get event name from topic
  const eventName = getEventNameFromTopic(webhookLog.topics[0]);
  
  if (eventName) {
    console.log(`   🎯 Event: ${eventName}`);
    
    // Use the unified decodeEventData function instead of individual decoders
    const decodedEvent = decodeEventData(webhookLog);
    
    if (decodedEvent) {
      console.log(`   📄 Event decoded successfully`);
      await handleAccessContractEvent(
        decodedEvent.eventName as any,
        decodedEvent.data,
        metadata
      );
    } else {
      console.log(`   ⚠️ Failed to decode event data for: ${eventName}`);
    }
  } else {
    console.log(`   ⚠️ Unknown event topic: ${webhookLog.topics[0]}`);
  }
}

export async function handleAccessContractEvent(
  eventType: string,
  eventData: object,
  metadata: EventMetadata
): Promise<void> {
  console.log(`🎯 Handling ${eventType} event...`);
  
  try {
    switch (eventType) {
      case 'AccessPurchased':
        await handleAccessPurchased(
          eventData as AccessPurchasedEvent.OutputObject, 
          metadata
        );
        break;
        
      case 'ResourceCreated':
        await handleResourceCreated(
          eventData as ResourceCreatedEvent.OutputObject, 
          metadata
        );
        break;
        
      case 'Withdrawal':
        await handleWithdrawal(
          eventData as WithdrawalEvent.OutputObject, 
          metadata
        );
        break;
        
      default:
        console.log(`⚠️ No handler found for event type: ${eventType}`);
        await handleUnknownEvent(eventType, eventData, metadata);
        break;
    }
  } catch (error) {
    console.error(`❌ Error handling ${eventType} event:`, error);
    throw error;
  }
}
