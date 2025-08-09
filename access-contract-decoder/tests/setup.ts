// Jest setup file
// Add any global test configuration here

// Mock console methods if needed for cleaner test output
const savedConsoleLog = console.log;
const savedConsoleWarn = console.warn;
const savedConsoleError = console.error;

// You can uncomment these to suppress console output during tests
// console.log = jest.fn();
// console.warn = jest.fn();
// console.error = jest.fn();

// Global test timeout
jest.setTimeout(10000);

// Clean up after tests
afterEach(() => {
  jest.clearAllMocks();
});

// Restore console methods after all tests
afterAll(() => {
  console.log = savedConsoleLog;
  console.warn = savedConsoleWarn;
  console.error = savedConsoleError;
});
