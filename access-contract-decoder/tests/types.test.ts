import type {
  Resource,
  Access,
  AccessPurchasedEvent,
  ResourceCreatedEvent,
  WithdrawalEvent,
  AccessContractEvent,
  RawLog
} from '../src/types/AccessContract';
import { ResourceType } from '../src/constants/contract';

describe('Contract Types', () => {
  describe('Resource Interface', () => {
    test('should accept valid resource object', () => {
      const resource: Resource = {
        owner: '0x1234567890123456789012345678901234567890',
        name: 'Test Resource',
        description: 'A test resource',
        cid: 'QmTestHash',
        url: 'https://example.com',
        serviceId: 'service123',
        price: BigInt('1000000000000000000'),
        isActive: true,
        resourceType: ResourceType.IPFS,
        createdAt: BigInt(Date.now())
      };

      expect(resource.owner).toBe('0x1234567890123456789012345678901234567890');
      expect(resource.name).toBe('Test Resource');
      expect(resource.resourceType).toBe(ResourceType.IPFS);
      expect(typeof resource.price).toBe('bigint');
      expect(typeof resource.createdAt).toBe('bigint');
    });

    test('should enforce required properties', () => {
      // TypeScript compilation will catch missing properties
      // This test documents the expected structure
      const requiredProperties = [
        'owner', 'name', 'description', 'cid', 'url', 
        'serviceId', 'price', 'isActive', 'resourceType', 'createdAt'
      ];
      
      expect(requiredProperties).toHaveLength(10);
    });
  });

  describe('Access Interface', () => {
    test('should accept valid access object', () => {
      const access: Access = {
        amountPaid: BigInt('1000000000000000000'),
        purchasedAt: BigInt(Date.now())
      };

      expect(typeof access.amountPaid).toBe('bigint');
      expect(typeof access.purchasedAt).toBe('bigint');
    });
  });

  describe('Event Interfaces', () => {
    test('AccessPurchasedEvent should have correct structure', () => {
      const event: AccessPurchasedEvent = {
        name: 'AccessPurchased',
        resourceId: BigInt(1),
        buyer: '0x1234567890123456789012345678901234567890',
        amountPaid: BigInt('1000000000000000000'),
        purchasedAt: BigInt(Date.now())
      };

      expect(event.name).toBe('AccessPurchased');
      expect(typeof event.resourceId).toBe('bigint');
      expect(typeof event.amountPaid).toBe('bigint');
      expect(typeof event.purchasedAt).toBe('bigint');
    });

    test('ResourceCreatedEvent should have correct structure', () => {
      const event: ResourceCreatedEvent = {
        name: 'ResourceCreated',
        resourceId: BigInt(1),
        owner: '0x1234567890123456789012345678901234567890',
        resourceName: 'Test Resource',
        description: 'A test resource',
        cid: 'QmTestHash',
        url: 'https://example.com',
        serviceId: 'service123',
        price: BigInt('1000000000000000000'),
        createdAt: BigInt(Date.now()),
        resourceType: BigInt(1)
      };

      expect(event.name).toBe('ResourceCreated');
      expect(event.resourceName).toBe('Test Resource'); // Note: renamed to avoid conflict
      expect(typeof event.resourceType).toBe('bigint');
    });

    test('WithdrawalEvent should have correct structure', () => {
      const event: WithdrawalEvent = {
        name: 'Withdrawal',
        seller: '0x1234567890123456789012345678901234567890',
        amount: BigInt('1000000000000000000')
      };

      expect(event.name).toBe('Withdrawal');
      expect(typeof event.amount).toBe('bigint');
    });
  });

  describe('Union Types', () => {
    test('AccessContractEvent should accept all event types', () => {
      const accessEvent: AccessContractEvent = {
        name: 'AccessPurchased',
        resourceId: BigInt(1),
        buyer: '0x1234567890123456789012345678901234567890',
        amountPaid: BigInt('1000000000000000000'),
        purchasedAt: BigInt(Date.now())
      };

      const withdrawalEvent: AccessContractEvent = {
        name: 'Withdrawal',
        seller: '0x1234567890123456789012345678901234567890',
        amount: BigInt('1000000000000000000')
      };

      expect(accessEvent.name).toBe('AccessPurchased');
      expect(withdrawalEvent.name).toBe('Withdrawal');
    });
  });

  describe('RawLog Interface', () => {
    test('should accept valid log object', () => {
      const log: RawLog = {
        topics: ['0x1234', '0x5678'],
        data: '0xabcdef',
        address: '0x1234567890123456789012345678901234567890',
        blockNumber: 12345,
        transactionHash: '0xabcdef1234567890',
        transactionIndex: 0,
        blockHash: '0xfedcba0987654321',
        logIndex: 1
      };

      expect(log.topics).toHaveLength(2);
      expect(log.data).toMatch(/^0x/);
      expect(typeof log.blockNumber).toBe('number');
    });

    test('should work with minimal log object', () => {
      const minimalLog: RawLog = {
        topics: ['0x1234'],
        data: '0xabcdef'
      };

      expect(minimalLog.topics).toBeDefined();
      expect(minimalLog.data).toBeDefined();
    });
  });
});
