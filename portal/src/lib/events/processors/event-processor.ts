import {
  WebhookLogWithMetadata
} from 'noo1-openr-contract-types';
import { handleWebhookLog } from '../handlers/access-contract-handler';
import { WebhookRequestBody } from '@/lib/events/types/webhook-payload';




// Helper function to format timestamp
function formatTimestamp(timestamp: string | bigint): string {
  return new Date(Number(timestamp) * 1000).toISOString();
}


// Main blockchain event handler - maps webhook data to WebhookLogWithMetadata and processes events
export async function handleBlockchainEvent(
  webhookData: WebhookRequestBody
): Promise<{ success: boolean; message: string; processedEvents: number }> {
  const { event } = webhookData;
  const logs = event.data.block.logs;

  console.log(`📦 Block: ${event.data.block.number}`);
  console.log(`⏰ Timestamp: ${formatTimestamp(event.data.block.timestamp)}`);
  console.log(`📝 Found ${logs.length} log(s)\n`);

  let processedEvents = 0;

  // Process each log entry
  for (const [index, log] of logs.entries()) {
    console.log(`🔍 Log ${index + 1}:`);
    console.log(`   Contract: ${log.account.address}`);
    console.log(`   Transaction: ${log.transaction.hash}`);

    try {
      // Map our webhook log to WebhookLogWithMetadata
      const webhookLog: WebhookLogWithMetadata = {
        topics: log.topics,
        data: log.data,
        address: log.account.address,
        blockNumber: event.data.block.number,
        transactionHash: log.transaction.hash,
        transactionIndex: log.transactionIndex,
        blockHash: log.blockHash,
        logIndex: log.logIndex,
        removed: log.removed,
        transaction: {
          hash: log.transaction.hash,
          blockNumber: log.transaction.blockNumber
        }
      };

      const metadata = {
        blockNumber: event.data.block.number,
        timestamp: event.data.block.timestamp,
        transactionHash: log.transaction.hash,
        contractAddress: log.account.address,
        logIndex: index
      };

      await handleWebhookLog(webhookLog, metadata);
      processedEvents++;

      console.log(`   ✅ Processed log ${index + 1}`);

    } catch (error) {
      console.error(`   ❌ Error processing log ${index + 1}:`, error);
      // Continue processing other logs even if one fails
    }

    console.log('');
  }

  console.log(`✅ Finished processing ${logs.length} log(s), handled ${processedEvents} events`);

  return {
    success: true,
    message: `Processed ${processedEvents} events from ${logs.length} logs`,
    processedEvents
  };
}
