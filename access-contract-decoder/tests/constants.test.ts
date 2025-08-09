import {
  CONTRACT_NAME,
  CONTRACT_VERSION,
  COMPILER_VERSION,
  ResourceType,
  EVENT_NAMES,
  EVENT_TOPICS,
  GAS_LIMITS,
  getContractVersion,
  ZERO_ADDRESS,
  MAX_UINT256
} from '../src/constants/contract';

describe('Contract Constants', () => {
  describe('Basic Constants', () => {
    test('should have correct contract name', () => {
      expect(CONTRACT_NAME).toBe('AccessContract');
    });

    test('should have dynamic contract version', () => {
      expect(CONTRACT_VERSION).toBe('dynamic');
    });

    test('should have compiler version', () => {
      expect(COMPILER_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });

    test('should have blockchain constants', () => {
      expect(ZERO_ADDRESS).toBe('0x0000000000000000000000000000000000000000');
      expect(MAX_UINT256).toBe('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
    });
  });

  describe('ResourceType Enum', () => {
    test('should have correct enum values', () => {
      expect(ResourceType.URL).toBe(0);
      expect(ResourceType.IPFS).toBe(1);
    });

    test('should have only expected enum keys', () => {
      const expectedKeys = ['URL', 'IPFS'];
      const actualKeys = Object.keys(ResourceType).filter(key => isNaN(Number(key)));
      expect(actualKeys).toEqual(expectedKeys);
    });
  });

  describe('Event Names', () => {
    test('should have expected event names', () => {
      const expectedEvents = [
        'AccessPurchased(uint256,address,uint256,uint256)',
        'Initialized(uint64)',
        'OwnershipTransferred(address,address)',
        'ResourceCreated(uint256,address,string,string,string,string,string,uint256,uint256,uint8)',
        'Withdrawal(address,uint256)'
      ];

      expectedEvents.forEach(eventName => {
        expect(EVENT_NAMES).toHaveProperty(eventName);
        expect(EVENT_NAMES[eventName as keyof typeof EVENT_NAMES]).toBe(eventName);
      });
    });

    test('should have matching number of events and topics', () => {
      expect(Object.keys(EVENT_NAMES)).toHaveLength(Object.keys(EVENT_TOPICS).length);
    });
  });

  describe('Event Topics', () => {
    test('should have valid topic hashes', () => {
      Object.values(EVENT_TOPICS).forEach(topic => {
        expect(topic).toMatch(/^0x[a-fA-F0-9]{64}$/);
      });
    });

    test('should have unique topic hashes', () => {
      const topics = Object.values(EVENT_TOPICS);
      const uniqueTopics = [...new Set(topics)];
      expect(topics).toHaveLength(uniqueTopics.length);
    });
  });

  describe('Gas Limits', () => {
    test('should have reasonable gas limits', () => {
      Object.entries(GAS_LIMITS).forEach(([functionName, gasLimit]) => {
        expect(gasLimit).toBeGreaterThan(0);
        expect(gasLimit).toBeLessThan(10000000); // Reasonable upper bound
        expect(Number.isInteger(gasLimit)).toBe(true);
      });
    });

    test('should have higher gas limits for complex operations', () => {
      expect(GAS_LIMITS.createResource).toBeGreaterThan(GAS_LIMITS.withdraw);
      expect(GAS_LIMITS.buyAccess).toBeGreaterThan(GAS_LIMITS.withdraw);
    });
  });

  describe('getContractVersion Function', () => {
    test('should throw error for missing VERSION function', async () => {
      const mockContract = {};
      
      await expect(getContractVersion(mockContract))
        .rejects
        .toThrow('VERSION constant not found on contract instance');
    });

    test('should return version for valid contract', async () => {
      const mockContract = {
        VERSION: jest.fn().mockResolvedValue('1.0.1')
      };

      const version = await getContractVersion(mockContract);
      expect(version).toBe('1.0.1');
      expect(mockContract.VERSION).toHaveBeenCalledTimes(1);
    });

    test('should handle VERSION function errors', async () => {
      const mockContract = {
        VERSION: jest.fn().mockRejectedValue(new Error('Network error'))
      };

      await expect(getContractVersion(mockContract))
        .rejects
        .toThrow('Network error');
    });
  });
});
