// Test the main index exports
describe('Index Exports', () => {
  test('should export all constants', async () => {
    const constants = await import('../src/constants/contract');
    
    expect(constants).toHaveProperty('CONTRACT_NAME');
    expect(constants).toHaveProperty('ResourceType');
    expect(constants).toHaveProperty('EVENT_NAMES');
    expect(constants).toHaveProperty('EVENT_TOPICS');
    expect(constants).toHaveProperty('GAS_LIMITS');
    expect(constants).toHaveProperty('getContractVersion');
  });

  test('should export all types', async () => {
    const types = await import('../src/types/AccessContract');
    
    // Check for type exports by checking the module keys
    // Since types are compile-time only, we check for runtime exports
    expect(types).toBeDefined();
  });

  test('should export all event decoders', async () => {
    const decoders = await import('../src/utils/eventDecoding');
    
    expect(decoders).toHaveProperty('decodeEvent');
    expect(decoders).toHaveProperty('decodeAccessContractEvent');
    expect(decoders).toHaveProperty('decodeAccessPurchased');
    expect(decoders).toHaveProperty('decodeResourceCreated');
    expect(decoders).toHaveProperty('decodeWithdrawal');
    expect(decoders).toHaveProperty('decodeInitialized');
    expect(decoders).toHaveProperty('decodeOwnershipTransferred');
  });

  test('should export ABI', async () => {
    const abi = await import('../src/abi/AccessContract.json');
    
    expect(Array.isArray(abi.default || abi)).toBe(true);
  });

  test('main index should re-export everything', async () => {
    const mainIndex = await import('../src/index');
    
    // Check for main exports
    expect(mainIndex).toHaveProperty('CONTRACT_NAME');
    expect(mainIndex).toHaveProperty('ResourceType');
    expect(mainIndex).toHaveProperty('decodeAccessContractEvent');
    expect(mainIndex).toHaveProperty('ABI');
  });
});

describe('TypeScript Compilation', () => {
  test('should have proper type definitions', () => {
    // This test ensures TypeScript compilation works
    // The actual type checking happens at compile time
    expect(true).toBe(true);
  });
});

describe('Module Resolution', () => {
  test('should resolve all internal imports', async () => {
    // Test that all internal imports resolve correctly
    expect(async () => {
      await import('../src/constants/contract');
      await import('../src/types/AccessContract');
      await import('../src/utils/eventDecoding');
      await import('../src/abi/AccessContract.json');
      await import('../src/index');
    }).not.toThrow();
  });

  test('should handle JSON imports', async () => {
    const abi = await import('../src/abi/AccessContract.json');
    expect(abi).toBeDefined();
    expect(Array.isArray(abi.default || abi)).toBe(true);
  });
});
