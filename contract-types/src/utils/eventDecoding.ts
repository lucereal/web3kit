import { AbiCoder } from "ethers";
import { EVENT_TOPICS, TOPIC_TO_EVENT_NAME, type EventName } from "../constants/eventTopics";
import type {
  AccessPurchasedEvent,
  AccessExpiredEvent,
  ResourceCreatedEvent,
  ResourceUpdatedEvent,
  ResourceDeactivatedEvent,
  ResourceDeletedEvent,
  WithdrawalEvent,
} from "../types/AccessContract";

// Import the contract ABI data
import AccessContractABI from "../abi/AccessContract.json";

/**
 * ABI Coder instance for decoding event data
 */
const abiCoder = AbiCoder.defaultAbiCoder();

/**
 * Extract event parameter types from contract ABI
 * This automatically gets the correct types for non-indexed parameters
 */
function extractEventParamTypes() {
  const eventParamTypes: Record<string, string[]> = {};
  
  // Filter ABI for events only and extract parameter types
  const events = AccessContractABI.filter((item: any) => item.type === 'event');
  
  for (const event of events) {
    const eventName = event.name;
    if (!eventName) continue; // Skip if no name
    
    // Only get non-indexed parameters (these go in the data field)
    const nonIndexedParams = event.inputs.filter((input: any) => !input.indexed);
    const paramTypes = nonIndexedParams.map((input: any) => {
      // Handle enum types
      if (input.type.startsWith('enum')) {
        return 'uint8'; // Enums are encoded as uint8
      }
      return input.type;
    });
    
    eventParamTypes[eventName] = paramTypes;
  }
  
  return eventParamTypes;
}

/**
 * Smart event parameter types extracted from ABI
 * Only includes non-indexed parameters that appear in the data field
 */
const EVENT_PARAM_TYPES = extractEventParamTypes();

/**
 * Extract indexed parameter info for topic decoding
 */
function extractIndexedParamTypes() {
  const indexedParamTypes: Record<string, Array<{name: string, type: string, index: number}>> = {};
  
  // Filter ABI for events only and extract indexed parameter info
  const events = AccessContractABI.filter((item: any) => item.type === 'event');
  
  for (const event of events) {
    const eventName = event.name;
    if (!eventName) continue; // Skip if no name
    
    // Get indexed parameters (these go in topics[1], topics[2], etc.)
    const indexedParams = event.inputs
      .filter((input: any) => input.indexed)
      .map((input: any, index: number) => ({
        name: input.name,
        type: input.type,
        index: index + 1 // topics[0] is the event signature
      }));
    
    indexedParamTypes[eventName] = indexedParams;
  }
  
  return indexedParamTypes;
}

/**
 * Indexed parameter information for topic decoding
 */
const INDEXED_PARAM_TYPES = extractIndexedParamTypes();

/**
 * Decoded event data type union
 */
export type DecodedEventData = 
  | { eventName: "AccessPurchased"; data: AccessPurchasedEvent.OutputObject }
  | { eventName: "AccessExpired"; data: AccessExpiredEvent.OutputObject }
  | { eventName: "ResourceCreated"; data: ResourceCreatedEvent.OutputObject }
  | { eventName: "Withdrawal"; data: WithdrawalEvent.OutputObject }
  | { eventName: "ResourceUpdated"; data: ResourceUpdatedEvent.OutputObject }
  | { eventName: "ResourceDeactivated"; data: ResourceDeactivatedEvent.OutputObject }
  | { eventName: "ResourceDeleted"; data: ResourceDeletedEvent.OutputObject };

/**
 * Raw webhook log structure
 */
export interface WebhookLog {
  topics: string[];
  data: string;
  address?: string;
  blockNumber?: string;
  transactionHash?: string;
  transactionIndex?: string;
  blockHash?: string;
  logIndex?: string;
  removed?: boolean;
}

/**
 * Decode indexed parameters from topics
 */
function decodeIndexedParams(eventName: string, topics: string[]): Record<string, any> {
  const indexedParams = INDEXED_PARAM_TYPES[eventName] || [];
  const decodedIndexed: Record<string, any> = {};
  
  for (const param of indexedParams) {
    if (topics[param.index]) {
      // Decode the topic based on the parameter type
      if (param.type === 'address') {
        // Address topics are padded to 32 bytes, take the last 20 bytes
        decodedIndexed[param.name] = '0x' + topics[param.index].slice(26);
      } else if (param.type.startsWith('uint')) {
        // Decode uint types
        decodedIndexed[param.name] = BigInt(topics[param.index]);
      } else {
        // For other types, keep as is (might need more specific handling)
        decodedIndexed[param.name] = topics[param.index];
      }
    }
  }
  
  return decodedIndexed;
}

/**
 * Decode event data from a webhook log
 * @param log - The webhook log containing topics and data
 * @returns Decoded event data or null if unable to decode
 */
export function decodeEventData(log: WebhookLog): DecodedEventData | null {
  if (!log.topics || log.topics.length === 0) {
    return null;
  }

  const topic = log.topics[0];
  const eventName = TOPIC_TO_EVENT_NAME[topic as keyof typeof TOPIC_TO_EVENT_NAME];
  
  if (!eventName) {
    return null;
  }

  try {
    // Get the correct parameter types for non-indexed params
    const paramTypes = EVENT_PARAM_TYPES[eventName];
    if (!paramTypes) {
      console.error(`No parameter types found for event: ${eventName}`);
      return null;
    }
    
    // Decode non-indexed parameters from data
    const decodedData = paramTypes.length > 0 ? abiCoder.decode(paramTypes, log.data) : [];
    
    // Decode indexed parameters from topics
    const decodedIndexed = decodeIndexedParams(eventName, log.topics);

    switch (eventName) {
      case "AccessPurchased":
        return {
          eventName,
          data: {
            resourceId: decodedData[0], // from data
            buyer: decodedIndexed.buyer, // from topics[1]
            expiresAt: decodedData[1], // from data
            usageLimit: decodedData[2], // from data
            amountPaid: decodedData[3], // from data
            purchasedAt: decodedData[4], // from data
            lastExtendedAt: decodedData[5], // from data
          }
        };

      case "AccessExpired":
        return {
          eventName,
          data: {
            resourceId: decodedIndexed.resourceId, // from topics[1]
            user: decodedIndexed.user, // from topics[2]
            reason: decodedData[0], // from data
            resourceName: decodedData[1], // from data
          }
        };

      case "ResourceCreated":
        return {
          eventName,
          data: {
            resourceId: decodedData[0], // from data
            owner: decodedIndexed.owner, // from topics[1]
            name: decodedData[1], // from data
            description: decodedData[2], // from data
            cid: decodedData[3], // from data
            url: decodedData[4], // from data
            serviceId: decodedData[5], // from data
            price: decodedData[6], // from data
            usageDuration: decodedData[7], // from data
            usageLimit: decodedData[8], // from data
            createdAt: decodedData[9], // from data
            resourceType: decodedData[10], // from data
          }
        };

      case "Withdrawal":
        return {
          eventName,
          data: {
            seller: decodedIndexed.seller, // from topics[1]
            amount: decodedData[0], // from data
          }
        };

      case "ResourceUpdated":
        return {
          eventName,
          data: {
            resourceId: decodedData[0], // from data
            owner: decodedIndexed.owner, // from topics[1]
            newName: decodedData[1], // from data
            newPrice: decodedData[2], // from data
            newCid: decodedData[3], // from data
            newUrl: decodedData[4], // from data
            newServiceId: decodedData[5], // from data
            newDuration: decodedData[6], // from data
            newUsageLimit: decodedData[7], // from data
            createdAt: decodedData[8], // from data
            updatedAt: decodedData[9], // from data
            newResourceType: decodedData[10], // from data
          }
        };

      case "ResourceDeactivated":
        return {
          eventName,
          data: {
            resourceId: decodedData[0], // from data
            owner: decodedIndexed.owner, // from topics[1]
            name: decodedData[1], // from data
            deactivatedAt: decodedData[2], // from data
          }
        };

      case "ResourceDeleted":
        return {
          eventName,
          data: {
            resourceId: decodedData[0], // from data
            owner: decodedIndexed.owner, // from topics[1]
            name: decodedData[1], // from data
            deletedAt: decodedData[2], // from data
          }
        };

      default:
        return null;
    }
  } catch (error) {
    console.error(`Error decoding ${eventName} event:`, error);
    return null;
  }
}

/**
 * Get event name from topic hash
 * @param topic - The event topic hash
 * @returns Event name or null if not found
 */
export function getEventNameFromTopic(topic: string): EventName | null {
  return TOPIC_TO_EVENT_NAME[topic as keyof typeof TOPIC_TO_EVENT_NAME] || null;
}

/**
 * Check if a topic hash is a known AccessContract event
 * @param topic - The event topic hash
 * @returns True if the topic is a known event
 */
export function isKnownEventTopic(topic: string): boolean {
  return topic in TOPIC_TO_EVENT_NAME;
}

/**
 * Format bigint values to strings for JSON serialization
 * @param data - Event data that may contain bigint values
 * @returns Data with bigint values converted to strings
 */
export function formatEventDataForSerialization(data: DecodedEventData): any {
  const formatBigInt = (obj: any): any => {
    if (typeof obj === 'bigint') {
      return obj.toString();
    }
    if (Array.isArray(obj)) {
      return obj.map(formatBigInt);
    }
    if (obj && typeof obj === 'object') {
      const formatted: any = {};
      for (const [key, value] of Object.entries(obj)) {
        formatted[key] = formatBigInt(value);
      }
      return formatted;
    }
    return obj;
  };

  return {
    eventName: data.eventName,
    data: formatBigInt(data.data)
  };
}
