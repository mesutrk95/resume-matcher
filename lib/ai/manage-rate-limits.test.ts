import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAllRateLimits,
  getClientRateLimits,
  setClientRateLimits,
  getUserRateLimitUsage,
  clearRateLimitUsage,
} from './manage-rate-limits';
import { db } from '@/lib/db';
import Logger from '@/lib/logger';

// Mock the database and logger
vi.mock('@/lib/db', () => ({
  db: {
    aIRateLimit: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    aIRateLimitUsage: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
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

describe('Rate Limits Management', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
  });

  describe('getAllRateLimits', () => {
    it('should return all rate limits', async () => {
      // Setup
      const mockRateLimits = [
        {
          id: 'limit1',
          clientId: 'client1',
          clientName: 'Client 1',
          requestsPerMinute: 5,
          requestsPerHour: 100,
          requestsPerDay: 1000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'limit2',
          clientId: 'client2',
          clientName: 'Client 2',
          requestsPerMinute: 10,
          requestsPerHour: 200,
          requestsPerDay: 2000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.aIRateLimit.findMany).mockResolvedValue(mockRateLimits);

      // Execute
      const result = await getAllRateLimits();

      // Verify
      expect(result).toEqual(mockRateLimits);
      expect(db.aIRateLimit.findMany).toHaveBeenCalledWith({
        orderBy: {
          clientName: 'asc',
        },
      });
    });

    it('should throw and log error when database operation fails', async () => {
      // Setup
      const error = new Error('Database error');
      vi.mocked(db.aIRateLimit.findMany).mockRejectedValue(error);

      // Execute & Verify
      await expect(getAllRateLimits()).rejects.toThrow(error);
      expect(Logger.error).toHaveBeenCalledWith('Error getting all rate limits', {
        error,
      });
    });
  });

  describe('getClientRateLimits', () => {
    it('should return rate limits for a specific client', async () => {
      // Setup
      const mockRateLimit = {
        id: 'limit1',
        clientId: 'client1',
        clientName: 'Client 1',
        requestsPerMinute: 5,
        requestsPerHour: 100,
        requestsPerDay: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.aIRateLimit.findUnique).mockResolvedValue(mockRateLimit);

      // Execute
      const result = await getClientRateLimits('client1');

      // Verify
      expect(result).toEqual(mockRateLimit);
      expect(db.aIRateLimit.findUnique).toHaveBeenCalledWith({
        where: { clientId: 'client1' },
      });
    });

    it('should throw and log error when database operation fails', async () => {
      // Setup
      const error = new Error('Database error');
      vi.mocked(db.aIRateLimit.findUnique).mockRejectedValue(error);

      // Execute & Verify
      await expect(getClientRateLimits('client1')).rejects.toThrow(error);
      expect(Logger.error).toHaveBeenCalledWith('Error getting rate limits for client client1', {
        error,
      });
    });
  });

  describe('setClientRateLimits', () => {
    it('should update rate limits for an existing client', async () => {
      // Setup
      const existingLimits = {
        id: 'limit1',
        clientId: 'client1',
        clientName: 'Client 1',
        requestsPerMinute: 5,
        requestsPerHour: 100,
        requestsPerDay: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedLimits = {
        ...existingLimits,
        requestsPerMinute: 10,
        requestsPerHour: 200,
      };

      vi.mocked(db.aIRateLimit.findUnique).mockResolvedValue(existingLimits);
      vi.mocked(db.aIRateLimit.update).mockResolvedValue(updatedLimits);

      // Execute
      const result = await setClientRateLimits('client1', {
        requestsPerMinute: 10,
        requestsPerHour: 200,
      });

      // Verify
      expect(result).toEqual(updatedLimits);
      expect(db.aIRateLimit.findUnique).toHaveBeenCalledWith({
        where: { clientId: 'client1' },
      });
      expect(db.aIRateLimit.update).toHaveBeenCalledWith({
        where: { clientId: 'client1' },
        data: {
          requestsPerMinute: 10,
          requestsPerHour: 200,
          requestsPerDay: 1000, // Unchanged
        },
      });
    });

    it('should throw error when client does not exist', async () => {
      // Setup
      vi.mocked(db.aIRateLimit.findUnique).mockResolvedValue(null);

      // Execute & Verify
      await expect(
        setClientRateLimits('nonexistent-client', { requestsPerMinute: 10 }),
      ).rejects.toThrow('Client nonexistent-client not found');
    });

    it('should throw and log error when database operation fails', async () => {
      // Setup
      const error = new Error('Database error');
      vi.mocked(db.aIRateLimit.findUnique).mockRejectedValue(error);

      // Execute & Verify
      await expect(setClientRateLimits('client1', { requestsPerMinute: 10 })).rejects.toThrow(
        error,
      );
      expect(Logger.error).toHaveBeenCalledWith('Error setting rate limits for client client1', {
        error,
      });
    });
  });

  describe('getUserRateLimitUsage', () => {
    it('should return usage statistics for a user and client', async () => {
      // Setup
      const now = new Date();
      vi.useFakeTimers();
      vi.setSystemTime(now);

      const minuteAgo = new Date(now.getTime() - 60 * 1000);
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Setup separate mocks for each timeframe call
      const minuteUsageRecords = [
        {
          id: 'usage1',
          userId: 'user123',
          clientId: 'client1',
          timestamp: new Date(),
          requestCount: 3,
        },
      ];

      const hourUsageRecords = [
        {
          id: 'usage2',
          userId: 'user123',
          clientId: 'client1',
          timestamp: new Date(),
          requestCount: 25,
        },
      ];

      const dayUsageRecords = [
        {
          id: 'usage3',
          userId: 'user123',
          clientId: 'client1',
          timestamp: new Date(),
          requestCount: 150,
        },
      ];

      // Use mockResolvedValueOnce for each expected call
      vi.mocked(db.aIRateLimitUsage.findMany)
        .mockResolvedValueOnce(minuteUsageRecords)
        .mockResolvedValueOnce(hourUsageRecords)
        .mockResolvedValueOnce(dayUsageRecords);

      vi.mocked(db.aIRateLimit.findUnique).mockResolvedValue({
        id: 'limit1',
        clientId: 'client1',
        clientName: 'Client 1',
        requestsPerMinute: 5,
        requestsPerHour: 100,
        requestsPerDay: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Execute
      const result = await getUserRateLimitUsage('user123', 'client1');

      // Verify
      expect(result).toEqual({
        minuteUsage: 3,
        hourUsage: 25,
        dayUsage: 150,
        limits: {
          id: 'limit1',
          clientId: 'client1',
          clientName: 'Client 1',
          requestsPerMinute: 5,
          requestsPerHour: 100,
          requestsPerDay: 1000,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      });

      // Verify the findMany calls
      expect(db.aIRateLimitUsage.findMany).toHaveBeenCalledTimes(3);

      vi.useRealTimers();
    });

    it('should throw and log error when database operation fails', async () => {
      // Setup
      const error = new Error('Database error');
      vi.mocked(db.aIRateLimitUsage.findMany).mockRejectedValue(error);

      // Execute & Verify
      await expect(getUserRateLimitUsage('user123', 'client1')).rejects.toThrow(error);
      expect(Logger.error).toHaveBeenCalledWith('Error getting rate limit usage for user user123', {
        error,
      });
    });
  });

  describe('clearRateLimitUsage', () => {
    it('should clear usage for a specific user and client', async () => {
      // Setup
      vi.mocked(db.aIRateLimitUsage.deleteMany).mockResolvedValue({ count: 5 });

      // Execute
      await clearRateLimitUsage('user123', 'client1');

      // Verify
      expect(db.aIRateLimitUsage.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: 'user123',
          clientId: 'client1',
        },
      });
      expect(Logger.info).toHaveBeenCalledWith(
        'Cleared rate limit usage for user user123 and client client1',
      );
    });

    it('should clear usage for a user across all clients when clientId is not provided', async () => {
      // Setup
      vi.mocked(db.aIRateLimitUsage.deleteMany).mockResolvedValue({
        count: 10,
      });

      // Execute
      await clearRateLimitUsage('user123');

      // Verify
      expect(db.aIRateLimitUsage.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: 'user123',
        },
      });
      expect(Logger.info).toHaveBeenCalledWith('Cleared rate limit usage for user user123');
    });

    it('should throw and log error when database operation fails', async () => {
      // Setup
      const error = new Error('Database error');
      vi.mocked(db.aIRateLimitUsage.deleteMany).mockRejectedValue(error);

      // Execute & Verify
      await expect(clearRateLimitUsage('user123')).rejects.toThrow(error);
      expect(Logger.error).toHaveBeenCalledWith(
        'Error clearing rate limit usage for user user123',
        { error },
      );
    });
  });
});
