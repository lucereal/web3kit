import type {
  AccessPurchasedEvent,
  AccessExpiredEvent,
  ResourceCreatedEvent,
  ResourceUpdatedEvent,
  WithdrawalEvent,
  ResourceDeactivatedEvent,
  ResourceDeletedEvent
} from '../types/AccessContract';
import { AbiCoder } from 'ethers';
import { EVENT_TOPICS } from '../constants/eventTopics';

const defaultAbiCoder = AbiCoder.defaultAbiCoder();

export interface DecodedEventResult<T = any> {
  eventName: string;
  data: T;
  transactionHash?: string;
  blockNumber?: number;
  logIndex?: number;
}

// Enhanced log interface for better type safety
export interface WebhookLogWithMetadata {
  topics: string[];
  data: string;
  address?: string;
  blockNumber?: string;
  transactionHash?: string;
  transactionIndex?: string;
  blockHash?: string;
  logIndex?: string;
  removed?: boolean;
  transaction?: {
    hash: string;
    blockNumber?: number;
  };
}

// Typed event decoders using the generated TypeScript types
export function decodeAccessPurchased(log: WebhookLogWithMetadata): DecodedEventResult<AccessPurchasedEvent.OutputObject> {
  const decoded = defaultAbiCoder.decode(['uint256', 'address', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256'], log.data);
  return {
    eventName: 'AccessPurchased',
    data: {
      resourceId: decoded[0],
      buyer: decoded[1],
      expiresAt: decoded[2],
      usageLimit: decoded[3],
      amountPaid: decoded[4],
      purchasedAt: decoded[5],
      lastExtendedAt: decoded[6]
    },
    transactionHash: log.transaction?.hash || log.transactionHash,
    blockNumber: log.transaction?.blockNumber || (log.blockNumber ? parseInt(log.blockNumber, 16) : undefined),
    logIndex: log.logIndex ? parseInt(log.logIndex, 16) : undefined
  };
}

export function decodeResourceCreated(log: WebhookLogWithMetadata): DecodedEventResult<ResourceCreatedEvent.OutputObject> {
  const decoded = defaultAbiCoder.decode(
    ['uint256', 'address', 'string', 'string', 'string', 'string', 'string', 'uint256', 'uint256', 'uint256', 'uint256', 'uint8'],
    log.data
  );
  return {
    eventName: 'ResourceCreated',
    data: {
      resourceId: decoded[0],
      owner: decoded[1],
      name: decoded[2],
      description: decoded[3],
      cid: decoded[4],
      url: decoded[5],
      serviceId: decoded[6],
      price: decoded[7],
      usageDuration: decoded[8],
      usageLimit: decoded[9],
      createdAt: decoded[10],
      resourceType: decoded[11]
    },
    transactionHash: log.transaction?.hash || log.transactionHash,
    blockNumber: log.transaction?.blockNumber || (log.blockNumber ? parseInt(log.blockNumber, 16) : undefined),
    logIndex: log.logIndex ? parseInt(log.logIndex, 16) : undefined
  };
}

export function decodeResourceUpdated(log: WebhookLogWithMetadata): DecodedEventResult<ResourceUpdatedEvent.OutputObject> {
  const decoded = defaultAbiCoder.decode(
    ['uint256', 'address', 'string', 'uint256', 'string', 'string', 'string', 'uint256', 'uint256', 'uint256', 'uint256', 'uint8'],
    log.data
  );
  return {
    eventName: 'ResourceUpdated',
    data: {
      resourceId: decoded[0],
      owner: decoded[1],
      newName: decoded[2],
      newPrice: decoded[3],
      newCid: decoded[4],
      newUrl: decoded[5],
      newServiceId: decoded[6],
      newDuration: decoded[7],
      newUsageLimit: decoded[8],
      createdAt: decoded[9],
      updatedAt: decoded[10],
      newResourceType: decoded[11]
    },
    transactionHash: log.transaction?.hash || log.transactionHash,
    blockNumber: log.transaction?.blockNumber || (log.blockNumber ? parseInt(log.blockNumber, 16) : undefined),
    logIndex: log.logIndex ? parseInt(log.logIndex, 16) : undefined
  };
}

export function decodeWithdrawal(log: WebhookLogWithMetadata): DecodedEventResult<WithdrawalEvent.OutputObject> {
  const decoded = defaultAbiCoder.decode(['address', 'uint256'], log.data);
  return {
    eventName: 'Withdrawal',
    data: {
      seller: decoded[0],
      amount: decoded[1]
    },
    transactionHash: log.transaction?.hash || log.transactionHash,
    blockNumber: log.transaction?.blockNumber || (log.blockNumber ? parseInt(log.blockNumber, 16) : undefined),
    logIndex: log.logIndex ? parseInt(log.logIndex, 16) : undefined
  };
}

export function decodeResourceDeactivated(log: WebhookLogWithMetadata): DecodedEventResult<ResourceDeactivatedEvent.OutputObject> {
  const decoded = defaultAbiCoder.decode(['uint256', 'address', 'string', 'uint256'], log.data);
  return {
    eventName: 'ResourceDeactivated',
    data: {
      resourceId: decoded[0],
      owner: decoded[1],
      name: decoded[2],
      deactivatedAt: decoded[3]
    },
    transactionHash: log.transaction?.hash || log.transactionHash,
    blockNumber: log.transaction?.blockNumber || (log.blockNumber ? parseInt(log.blockNumber, 16) : undefined),
    logIndex: log.logIndex ? parseInt(log.logIndex, 16) : undefined
  };
}

export function decodeResourceDeleted(log: WebhookLogWithMetadata): DecodedEventResult<ResourceDeletedEvent.OutputObject> {
  const decoded = defaultAbiCoder.decode(['uint256', 'address', 'string', 'uint256'], log.data);
  return {
    eventName: 'ResourceDeleted',
    data: {
      resourceId: decoded[0],
      owner: decoded[1],
      name: decoded[2],
      deletedAt: decoded[3]
    },
    transactionHash: log.transaction?.hash || log.transactionHash,
    blockNumber: log.transaction?.blockNumber || (log.blockNumber ? parseInt(log.blockNumber, 16) : undefined),
    logIndex: log.logIndex ? parseInt(log.logIndex, 16) : undefined
  };
}

export function decodeAccessExpired(log: WebhookLogWithMetadata): DecodedEventResult<AccessExpiredEvent.OutputObject> {
  const decoded = defaultAbiCoder.decode(['uint256', 'address', 'string', 'string'], log.data);
  return {
    eventName: 'AccessExpired',
    data: {
      resourceId: decoded[0],
      user: decoded[1],
      reason: decoded[2],
      resourceName: decoded[3]
    },
    transactionHash: log.transaction?.hash || log.transactionHash,
    blockNumber: log.transaction?.blockNumber || (log.blockNumber ? parseInt(log.blockNumber, 16) : undefined),
    logIndex: log.logIndex ? parseInt(log.logIndex, 16) : undefined
  };
}

// Master decoder function with full type safety
export function decodeEventWithTypes(log: WebhookLogWithMetadata): DecodedEventResult | null {
  if (!log.topics || log.topics.length === 0) {
    return null;
  }

  const eventTopic = log.topics[0];
  
  try {
    switch (eventTopic) {
      case EVENT_TOPICS.AccessPurchased:
        return decodeAccessPurchased(log);
      case EVENT_TOPICS.ResourceCreated:
        return decodeResourceCreated(log);
      case EVENT_TOPICS.ResourceUpdated:
        return decodeResourceUpdated(log);
      case EVENT_TOPICS.Withdrawal:
        return decodeWithdrawal(log);
      case EVENT_TOPICS.ResourceDeactivated:
        return decodeResourceDeactivated(log);
      case EVENT_TOPICS.ResourceDeleted:
        return decodeResourceDeleted(log);
      default:
        return null;
    }
  } catch (error) {
    console.error(`Error decoding event with topic ${eventTopic}:`, error);
    return null;
  }
}

// Type guards for event data
export function isAccessPurchasedEvent(decoded: DecodedEventResult): decoded is DecodedEventResult<AccessPurchasedEvent.OutputObject> {
  return decoded.eventName === 'AccessPurchased';
}

export function isResourceCreatedEvent(decoded: DecodedEventResult): decoded is DecodedEventResult<ResourceCreatedEvent.OutputObject> {
  return decoded.eventName === 'ResourceCreated';
}

export function isResourceUpdatedEvent(decoded: DecodedEventResult): decoded is DecodedEventResult<ResourceUpdatedEvent.OutputObject> {
  return decoded.eventName === 'ResourceUpdated';
}

export function isWithdrawalEvent(decoded: DecodedEventResult): decoded is DecodedEventResult<WithdrawalEvent.OutputObject> {
  return decoded.eventName === 'Withdrawal';
}

export function isResourceDeactivatedEvent(decoded: DecodedEventResult): decoded is DecodedEventResult<ResourceDeactivatedEvent.OutputObject> {
  return decoded.eventName === 'ResourceDeactivated';
}

export function isResourceDeletedEvent(decoded: DecodedEventResult): decoded is DecodedEventResult<ResourceDeletedEvent.OutputObject> {
  return decoded.eventName === 'ResourceDeleted';
}

// Utility to format all events for serialization with proper typing
export function formatTypedEventForSerialization(decoded: DecodedEventResult): any {
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
    eventName: decoded.eventName,
    data: formatBigInt(decoded.data),
    transactionHash: decoded.transactionHash,
    blockNumber: decoded.blockNumber,
    logIndex: decoded.logIndex
  };
}
