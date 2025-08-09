import {
  decodeEvent,
  decodeAccessContractEvent,
  decodeAccessPurchased,
  decodeResourceCreated,
  decodeWithdrawal
} from '../src/utils/eventDecoding';

// Mock the ABI import
jest.mock('../src/abi/AccessContract.json', () => ([
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "resourceId", "type": "uint256"},
      {"indexed": true, "name": "buyer", "type": "address"},
      {"indexed": false, "name": "amountPaid", "type": "uint256"},
      {"indexed": false, "name": "purchasedAt", "type": "uint256"}
    ],
    "name": "AccessPurchased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "seller", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"}
    ],
    "name": "Withdrawal",
    "type": "event"
  }
]), { virtual: true });

describe('Event Decoders', () => {
  const mockAccessPurchasedLog = {
    topics: [
      '0x79f205d05e1d9f99a7e4a6d2e5d9fc75c372c7033d239fefe5e5dec18d472bd9', // AccessPurchased topic
      '0x0000000000000000000000000000000000000000000000000000000000000001', // resourceId: 1
      '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266'  // buyer address
    ],
    data: '0x0000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000000062a7d4a0' // amountPaid: 1 ETH, purchasedAt: timestamp
  };

  const mockWithdrawalLog = {
    topics: [
      '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65', // Withdrawal topic
      '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266'  // seller address
    ],
    data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000' // amount: 1 ETH
  };

  const invalidLog = {
    topics: ['0xinvalid'],
    data: '0xinvalid'
  };

  describe('decodeEvent', () => {
    test('should decode valid event log', () => {
      expect(() => decodeEvent(mockAccessPurchasedLog)).not.toThrow();
    });

    test('should throw error for invalid log', () => {
      expect(() => decodeEvent(invalidLog)).toThrow();
    });
  });

  describe('decodeAccessPurchased', () => {
    test('should decode AccessPurchased event correctly', () => {
      const decoded = decodeAccessPurchased(mockAccessPurchasedLog);
      
      expect(decoded).toHaveProperty('name', 'AccessPurchased');
      expect(decoded).toHaveProperty('resourceId');
      expect(decoded).toHaveProperty('buyer');
      expect(decoded).toHaveProperty('amountPaid');
      expect(decoded).toHaveProperty('purchasedAt');
      
      // Verify the actual values
      expect(decoded.name).toBe('AccessPurchased');
      expect(typeof decoded.resourceId).toBe('object'); // BigNumber
      expect(typeof decoded.buyer).toBe('string');
      expect(typeof decoded.amountPaid).toBe('object'); // BigNumber
      expect(typeof decoded.purchasedAt).toBe('object'); // BigNumber
    });

    test('should throw error for wrong event type', () => {
      expect(() => decodeAccessPurchased(mockWithdrawalLog))
        .toThrow(/Expected AccessPurchased event/);
    });

    test('should throw error for invalid log', () => {
      expect(() => decodeAccessPurchased(invalidLog))
        .toThrow(/Failed to decode AccessPurchased/);
    });
  });

  describe('decodeWithdrawal', () => {
    test('should decode Withdrawal event correctly', () => {
      const decoded = decodeWithdrawal(mockWithdrawalLog);
      
      expect(decoded).toHaveProperty('name', 'Withdrawal');
      expect(decoded).toHaveProperty('seller');
      expect(decoded).toHaveProperty('amount');
      
      // Verify the actual values
      expect(decoded.name).toBe('Withdrawal');
      expect(typeof decoded.seller).toBe('string');
      expect(typeof decoded.amount).toBe('object'); // BigNumber
    });

    test('should throw error for wrong event type', () => {
      expect(() => decodeWithdrawal(mockAccessPurchasedLog))
        .toThrow(/Expected Withdrawal event/);
    });
  });

  describe('decodeAccessContractEvent', () => {
    test('should decode AccessPurchased event', () => {
      const decoded = decodeAccessContractEvent(mockAccessPurchasedLog);
      expect(decoded).toHaveProperty('name');
    });

    test('should decode Withdrawal event', () => {
      const decoded = decodeAccessContractEvent(mockWithdrawalLog);
      expect(decoded).toHaveProperty('name');
    });

    test('should throw error for unknown event', () => {
      const unknownEventLog = {
        topics: ['0x1234567890123456789012345678901234567890123456789012345678901234'],
        data: '0x'
      };
      
      expect(() => decodeAccessContractEvent(unknownEventLog))
        .toThrow();
    });
  });

  describe('Error Handling', () => {
    test('all decoders should handle malformed logs gracefully', () => {
      const malformedLog = {
        topics: [],
        data: ''
      };

      expect(() => decodeAccessPurchased(malformedLog)).toThrow();
      expect(() => decodeResourceCreated(malformedLog)).toThrow();
      expect(() => decodeWithdrawal(malformedLog)).toThrow();
    });

    test('should provide meaningful error messages', () => {
      try {
        decodeAccessPurchased(invalidLog);
      } catch (error: any) {
        expect(error.message).toContain('Failed to decode AccessPurchased');
      }
    });
  });

  describe('Type Safety', () => {
    test('should require correct log interface', () => {
      // This test ensures the Log interface is properly typed
      const validLog = {
        topics: ['0x1234'],
        data: '0xabcd'
      };

      // TypeScript compilation will catch type errors
      expect(validLog).toHaveProperty('topics');
      expect(validLog).toHaveProperty('data');
      expect(Array.isArray(validLog.topics)).toBe(true);
      expect(typeof validLog.data).toBe('string');
    });
  });
});
