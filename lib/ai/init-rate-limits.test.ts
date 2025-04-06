import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initializeRateLimits, updateRateLimits } from './init-rate-limits';
import { db } from '@/lib/db';
import Logger from '@/lib/logger';

// Mock the database and logger
vi.mock('@/lib/db', () => ({
  db: {
    aIRateLimit: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('@/lib/logger', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Rate Limits Initialization', () => {
  // Create a mock client
  const mockClient = {
    generateContent: vi.fn(),
    generateChatContent: vi.fn(),
    calculateTokens: vi.fn(),
    getModelInfo: vi.fn(),
    getClientId: vi.fn(),
    getClientName: vi.fn(),
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();

    // Setup mock return values - IMPORTANT: this needs to be done after resetAllMocks
    mockClient.getClientId.mockReturnValue('test-client-id');
    mockClient.getClientName.mockReturnValue('Test Client');
  });

  describe('initializeRateLimits', () => {
    it('should create rate limits when they do not exist', async () => {
      // Setup
      vi.mocked(db.aIRateLimit.findUnique).mockResolvedValue(null);
      vi.mocked(db.aIRateLimit.create).mockResolvedValue({
        id: 'rate-limit-1',
        clientId: 'test-client-id',
        clientName: 'Test Client',
        requestsPerMinute: 5,
        requestsPerHour: 100,
        requestsPerDay: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Execute
      await initializeRateLimits(mockClient);

      // Verify
      expect(db.aIRateLimit.findUnique).toHaveBeenCalledWith({
        where: { clientId: 'test-client-id' },
      });
      expect(db.aIRateLimit.create).toHaveBeenCalledWith({
        data: {
          clientId: 'test-client-id',
          clientName: 'Test Client',
          requestsPerMinute: 5,
          requestsPerHour: 100,
          requestsPerDay: 1000,
        },
      });
      expect(Logger.info).toHaveBeenCalledWith(
        'Initialized rate limits for client Test Client',
      );
    });

    it('should create rate limits with custom values when provided', async () => {
      // Setup
      vi.mocked(db.aIRateLimit.findUnique).mockResolvedValue(null);
      vi.mocked(db.aIRateLimit.create).mockResolvedValue({
        id: 'rate-limit-1',
        clientId: 'test-client-id',
        clientName: 'Test Client',
        requestsPerMinute: 10,
        requestsPerHour: 200,
        requestsPerDay: 2000,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const customOptions = {
        requestsPerMinute: 10,
        requestsPerHour: 200,
        requestsPerDay: 2000,
      };

      // Execute
      await initializeRateLimits(mockClient, customOptions);

      // Verify
      expect(db.aIRateLimit.create).toHaveBeenCalledWith({
        data: {
          clientId: 'test-client-id',
          clientName: 'Test Client',
          requestsPerMinute: 10,
          requestsPerHour: 200,
          requestsPerDay: 2000,
        },
      });
    });

    it('should not create rate limits when they already exist', async () => {
      // Setup
      vi.mocked(db.aIRateLimit.findUnique).mockResolvedValue({
        id: 'rate-limit-1',
        clientId: 'test-client-id',
        clientName: 'Test Client',
        requestsPerMinute: 5,
        requestsPerHour: 100,
        requestsPerDay: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Execute
      await initializeRateLimits(mockClient);

      // Verify
      expect(db.aIRateLimit.findUnique).toHaveBeenCalledWith({
        where: { clientId: 'test-client-id' },
      });
      expect(db.aIRateLimit.create).not.toHaveBeenCalled();
      expect(Logger.info).not.toHaveBeenCalled();
    });

    it('should log error but continue execution when an error occurs', async () => {
      // Setup
      const error = new Error('Database error');
      vi.mocked(db.aIRateLimit.findUnique).mockRejectedValue(error);

      // Execute
      await initializeRateLimits(mockClient);

      // Verify
      expect(Logger.error).toHaveBeenCalledWith(
        'Error initializing rate limits',
        {
          error,
        },
      );
      expect(db.aIRateLimit.create).not.toHaveBeenCalled();
    });
  });

  describe('updateRateLimits', () => {
    it('should update rate limits when they exist', async () => {
      // Setup
      const existingLimits = {
        id: 'rate-limit-1',
        clientId: 'test-client-id',
        clientName: 'Test Client',
        requestsPerMinute: 5,
        requestsPerHour: 100,
        requestsPerDay: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.aIRateLimit.findUnique).mockResolvedValue(existingLimits);
      vi.mocked(db.aIRateLimit.update).mockResolvedValue({
        ...existingLimits,
        requestsPerMinute: 10,
      });

      const updateOptions = {
        requestsPerMinute: 10,
      };

      // Execute
      await updateRateLimits('test-client-id', updateOptions);

      // Verify
      expect(db.aIRateLimit.findUnique).toHaveBeenCalledWith({
        where: { clientId: 'test-client-id' },
      });
      expect(db.aIRateLimit.update).toHaveBeenCalledWith({
        where: { clientId: 'test-client-id' },
        data: {
          requestsPerMinute: 10,
          requestsPerHour: 100,
          requestsPerDay: 1000,
        },
      });
      expect(Logger.info).toHaveBeenCalledWith(
        'Updated rate limits for client test-client-id',
      );
    });

    it('should update multiple rate limit values when provided', async () => {
      // Setup
      const existingLimits = {
        id: 'rate-limit-1',
        clientId: 'test-client-id',
        clientName: 'Test Client',
        requestsPerMinute: 5,
        requestsPerHour: 100,
        requestsPerDay: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.aIRateLimit.findUnique).mockResolvedValue(existingLimits);
      vi.mocked(db.aIRateLimit.update).mockResolvedValue({
        ...existingLimits,
        requestsPerMinute: 10,
        requestsPerHour: 200,
        requestsPerDay: 2000,
      });

      const updateOptions = {
        requestsPerMinute: 10,
        requestsPerHour: 200,
        requestsPerDay: 2000,
      };

      // Execute
      await updateRateLimits('test-client-id', updateOptions);

      // Verify
      expect(db.aIRateLimit.update).toHaveBeenCalledWith({
        where: { clientId: 'test-client-id' },
        data: {
          requestsPerMinute: 10,
          requestsPerHour: 200,
          requestsPerDay: 2000,
        },
      });
    });

    it('should log warning when client does not exist', async () => {
      // Setup
      vi.mocked(db.aIRateLimit.findUnique).mockResolvedValue(null);

      const updateOptions = {
        requestsPerMinute: 10,
      };

      // Execute
      await updateRateLimits('test-client-id', updateOptions);

      // Verify
      expect(db.aIRateLimit.update).not.toHaveBeenCalled();
      expect(Logger.warn).toHaveBeenCalledWith(
        'Attempted to update rate limits for non-existent client test-client-id',
      );
    });

    it('should throw error when an error occurs', async () => {
      // Setup
      const error = new Error('Database error');
      vi.mocked(db.aIRateLimit.findUnique).mockRejectedValue(error);

      const updateOptions = {
        requestsPerMinute: 10,
      };

      // Execute & Verify
      await expect(
        updateRateLimits('test-client-id', updateOptions),
      ).rejects.toThrow(error);
      expect(Logger.error).toHaveBeenCalledWith('Error updating rate limits', {
        error,
      });
    });
  });
});
