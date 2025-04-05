import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AIRateLimitService } from './rate-limit-service';
import { db } from '@/lib/db';
import Logger from '@/lib/logger';

// Mock the database and logger
vi.mock('@/lib/db', () => ({
  db: {
    aIRateLimitUsage: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
    },
    aIRateLimit: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/logger', () => ({
  default: {
    error: vi.fn(),
  },
}));

describe('AIRateLimitService', () => {
  let service: AIRateLimitService;
  const originalEnv = process.env;

  beforeEach(() => {
    service = new AIRateLimitService();
    // Reset mocks before each test
    vi.resetAllMocks();
    // Mock environment variables
    vi.stubEnv('NODE_ENV', 'production'); // Default to production for tests
    vi.stubEnv('DISABLE_RATE_LIMITING', 'false');
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('checkRateLimit', () => {
    it('should allow requests when all limits are not exceeded', async () => {
      // Setup
      vi.mocked(db.aIRateLimit.findUnique).mockResolvedValue({
        id: 'limit1',
        clientId: 'client123',
        clientName: 'Test Client',
        requestsPerMinute: 10,
        requestsPerHour: 100,
        requestsPerDay: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock checkTimeframeLimit to return false (not exceeded)
      const checkTimeframeLimitSpy = vi.spyOn(
        service as any,
        'checkTimeframeLimit',
      );
      checkTimeframeLimitSpy.mockResolvedValue(false);

      // Execute
      const result = await service.checkRateLimit('user123', 'client123');

      // Verify
      expect(result).toEqual({ allowed: true });
      expect(checkTimeframeLimitSpy).toHaveBeenCalledTimes(3);
    });

    it('should deny requests when minute limit is exceeded', async () => {
      // Setup
      vi.mocked(db.aIRateLimit.findUnique).mockResolvedValue({
        id: 'limit1',
        clientId: 'client123',
        clientName: 'Test Client',
        requestsPerMinute: 10,
        requestsPerHour: 100,
        requestsPerDay: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock checkTimeframeLimit to return true for minute (exceeded)
      const checkTimeframeLimitSpy = vi.spyOn(
        service as any,
        'checkTimeframeLimit',
      );
      checkTimeframeLimitSpy.mockImplementation(
        (userId, clientId, timeframe) => {
          return Promise.resolve(timeframe === 'minute');
        },
      );

      // Execute
      const result = await service.checkRateLimit('user123', 'client123');

      // Verify
      expect(result).toEqual({
        allowed: false,
        reason: 'Rate limit exceeded: 10 requests per minute',
      });
      expect(checkTimeframeLimitSpy).toHaveBeenCalledTimes(1);
    });

    it('should deny requests when hour limit is exceeded', async () => {
      // Setup
      vi.mocked(db.aIRateLimit.findUnique).mockResolvedValue({
        id: 'limit1',
        clientId: 'client123',
        clientName: 'Test Client',
        requestsPerMinute: 10,
        requestsPerHour: 100,
        requestsPerDay: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock checkTimeframeLimit to return true for hour (exceeded)
      const checkTimeframeLimitSpy = vi.spyOn(
        service as any,
        'checkTimeframeLimit',
      );
      checkTimeframeLimitSpy.mockImplementation(
        (userId, clientId, timeframe) => {
          return Promise.resolve(timeframe === 'hour');
        },
      );

      // Execute
      const result = await service.checkRateLimit('user123', 'client123');

      // Verify
      expect(result).toEqual({
        allowed: false,
        reason: 'Rate limit exceeded: 100 requests per hour',
      });
      expect(checkTimeframeLimitSpy).toHaveBeenCalledTimes(2);
    });

    it('should deny requests when day limit is exceeded', async () => {
      // Setup
      vi.mocked(db.aIRateLimit.findUnique).mockResolvedValue({
        id: 'limit1',
        clientId: 'client123',
        clientName: 'Test Client',
        requestsPerMinute: 10,
        requestsPerHour: 100,
        requestsPerDay: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock checkTimeframeLimit to return true for day (exceeded)
      const checkTimeframeLimitSpy = vi.spyOn(
        service as any,
        'checkTimeframeLimit',
      );
      checkTimeframeLimitSpy.mockImplementation(
        (userId, clientId, timeframe) => {
          if (timeframe === 'minute') return Promise.resolve(false);
          if (timeframe === 'hour') return Promise.resolve(false);
          if (timeframe === 'day') return Promise.resolve(true);
          return Promise.resolve(false);
        },
      );

      // Execute
      const result = await service.checkRateLimit('user123', 'client123');

      // Verify
      expect(result).toEqual({
        allowed: false,
        reason: 'Rate limit exceeded: 1000 requests per day',
      });
      expect(checkTimeframeLimitSpy).toHaveBeenCalledTimes(3);
    });

    it('should allow requests and use default limits when no client config exists', async () => {
      // Setup
      vi.mocked(db.aIRateLimit.findUnique).mockResolvedValue(null);

      // Mock checkTimeframeLimit to return false (not exceeded)
      const checkTimeframeLimitSpy = vi.spyOn(
        service as any,
        'checkTimeframeLimit',
      );
      checkTimeframeLimitSpy.mockResolvedValue(false);

      // Execute
      const result = await service.checkRateLimit('user123', 'client123');

      // Verify
      expect(result).toEqual({ allowed: true });
      expect(checkTimeframeLimitSpy).toHaveBeenCalledTimes(3);
      // Verify default limits were used
      expect(checkTimeframeLimitSpy).toHaveBeenCalledWith(
        'user123',
        'client123',
        'minute',
        5,
      );
      expect(checkTimeframeLimitSpy).toHaveBeenCalledWith(
        'user123',
        'client123',
        'hour',
        100,
      );
      expect(checkTimeframeLimitSpy).toHaveBeenCalledWith(
        'user123',
        'client123',
        'day',
        1000,
      );
    });

    it('should allow requests when an error occurs and log the error', async () => {
      // Setup
      const error = new Error('Database error');
      vi.mocked(db.aIRateLimit.findUnique).mockRejectedValue(error);

      // Execute
      const result = await service.checkRateLimit('user123', 'client123');

      // Verify
      expect(result).toEqual({ allowed: true });
      expect(Logger.error).toHaveBeenCalledWith(
        'Error checking rate limit for user user123',
        { error },
      );
    });
  });

  describe('recordRequest', () => {
    it('should update existing record when found', async () => {
      // Setup
      const now = new Date();
      vi.useFakeTimers();
      vi.setSystemTime(now);

      const minuteTimestamp = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
      );

      const existingRecord = {
        id: 'usage1',
        userId: 'user123',
        clientId: 'client123',
        timestamp: minuteTimestamp,
        requestCount: 5,
      };

      vi.mocked(db.aIRateLimitUsage.findUnique).mockResolvedValue(
        existingRecord,
      );

      // Execute
      await service.recordRequest('user123', 'client123');

      // Verify
      expect(db.aIRateLimitUsage.findUnique).toHaveBeenCalledWith({
        where: {
          userId_clientId_timestamp: {
            userId: 'user123',
            clientId: 'client123',
            timestamp: minuteTimestamp,
          },
        },
      });

      expect(db.aIRateLimitUsage.update).toHaveBeenCalledWith({
        where: {
          id: 'usage1',
        },
        data: {
          requestCount: 6, // Incremented from 5
        },
      });

      expect(db.aIRateLimitUsage.create).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should create new record when not found', async () => {
      // Setup
      const now = new Date();
      vi.useFakeTimers();
      vi.setSystemTime(now);

      const minuteTimestamp = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
      );

      vi.mocked(db.aIRateLimitUsage.findUnique).mockResolvedValue(null);

      // Execute
      await service.recordRequest('user123', 'client123');

      // Verify
      expect(db.aIRateLimitUsage.findUnique).toHaveBeenCalledWith({
        where: {
          userId_clientId_timestamp: {
            userId: 'user123',
            clientId: 'client123',
            timestamp: minuteTimestamp,
          },
        },
      });

      expect(db.aIRateLimitUsage.create).toHaveBeenCalledWith({
        data: {
          userId: 'user123',
          clientId: 'client123',
          timestamp: minuteTimestamp,
          requestCount: 1,
        },
      });

      expect(db.aIRateLimitUsage.update).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should log error but continue execution when an error occurs', async () => {
      // Setup
      const error = new Error('Database error');
      vi.mocked(db.aIRateLimitUsage.findUnique).mockRejectedValue(error);

      // Execute
      await service.recordRequest('user123', 'client123');

      // Verify
      expect(Logger.error).toHaveBeenCalledWith(
        'Error recording rate limit usage for user user123',
        { error },
      );
    });
  });

  describe('getRateLimitStats', () => {
    it('should return usage statistics and limits', async () => {
      // Setup
      const now = new Date();
      vi.useFakeTimers();
      vi.setSystemTime(now);

      const minuteAgo = new Date(now.getTime() - 60 * 1000);
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const getUsageInTimeframeSpy = vi.spyOn(
        service as any,
        'getUsageInTimeframe',
      );
      getUsageInTimeframeSpy.mockImplementation((...args: any[]) => {
        const startTime = args[2] as Date;
        if (startTime.getTime() === minuteAgo.getTime())
          return Promise.resolve(3);
        if (startTime.getTime() === hourAgo.getTime())
          return Promise.resolve(25);
        if (startTime.getTime() === dayAgo.getTime())
          return Promise.resolve(150);
        return Promise.resolve(0);
      });

      vi.mocked(db.aIRateLimit.findUnique).mockResolvedValue({
        requestsPerMinute: 10,
        requestsPerHour: 100,
        requestsPerDay: 1000,
      } as any);

      // Execute
      const result = await service.getRateLimitStats('user123', 'client123');

      // Verify
      expect(result).toEqual({
        minuteUsage: 3,
        hourUsage: 25,
        dayUsage: 150,
        limits: {
          requestsPerMinute: 10,
          requestsPerHour: 100,
          requestsPerDay: 1000,
        },
      });

      expect(getUsageInTimeframeSpy).toHaveBeenCalledTimes(3);
      expect(getUsageInTimeframeSpy).toHaveBeenCalledWith(
        'user123',
        'client123',
        minuteAgo,
        now,
      );
      expect(getUsageInTimeframeSpy).toHaveBeenCalledWith(
        'user123',
        'client123',
        hourAgo,
        now,
      );
      expect(getUsageInTimeframeSpy).toHaveBeenCalledWith(
        'user123',
        'client123',
        dayAgo,
        now,
      );

      vi.useRealTimers();
    });
  });

  describe('checkTimeframeLimit', () => {
    it('should return true when usage exceeds limit', async () => {
      // Setup
      const getUsageInTimeframeSpy = vi.spyOn(
        service as any,
        'getUsageInTimeframe',
      );
      getUsageInTimeframeSpy.mockResolvedValue(15); // Usage is 15

      // Execute
      const result = await (service as any).checkTimeframeLimit(
        'user123',
        'client123',
        'minute',
        10, // Limit is 10
      );

      // Verify
      expect(result).toBe(true);
      expect(getUsageInTimeframeSpy).toHaveBeenCalledTimes(1);
    });

    it('should return false when usage does not exceed limit', async () => {
      // Setup
      const getUsageInTimeframeSpy = vi.spyOn(
        service as any,
        'getUsageInTimeframe',
      );
      getUsageInTimeframeSpy.mockResolvedValue(5); // Usage is 5

      // Execute
      const result = await (service as any).checkTimeframeLimit(
        'user123',
        'client123',
        'minute',
        10, // Limit is 10
      );

      // Verify
      expect(result).toBe(false);
      expect(getUsageInTimeframeSpy).toHaveBeenCalledTimes(1);
    });

    it('should calculate correct timeframe for minute', async () => {
      // Setup
      const now = new Date();
      vi.useFakeTimers();
      vi.setSystemTime(now);

      const getUsageInTimeframeSpy = vi.spyOn(
        service as any,
        'getUsageInTimeframe',
      );
      getUsageInTimeframeSpy.mockResolvedValue(5);

      // Execute
      await (service as any).checkTimeframeLimit(
        'user123',
        'client123',
        'minute',
        10,
      );

      // Verify
      const minuteAgo = new Date(now.getTime() - 60 * 1000);
      expect(getUsageInTimeframeSpy).toHaveBeenCalledWith(
        'user123',
        'client123',
        minuteAgo,
        now,
      );

      vi.useRealTimers();
    });

    it('should calculate correct timeframe for hour', async () => {
      // Setup
      const now = new Date();
      vi.useFakeTimers();
      vi.setSystemTime(now);

      const getUsageInTimeframeSpy = vi.spyOn(
        service as any,
        'getUsageInTimeframe',
      );
      getUsageInTimeframeSpy.mockResolvedValue(50);

      // Execute
      await (service as any).checkTimeframeLimit(
        'user123',
        'client123',
        'hour',
        100,
      );

      // Verify
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      expect(getUsageInTimeframeSpy).toHaveBeenCalledWith(
        'user123',
        'client123',
        hourAgo,
        now,
      );

      vi.useRealTimers();
    });

    it('should calculate correct timeframe for day', async () => {
      // Setup
      const now = new Date();
      vi.useFakeTimers();
      vi.setSystemTime(now);

      const getUsageInTimeframeSpy = vi.spyOn(
        service as any,
        'getUsageInTimeframe',
      );
      getUsageInTimeframeSpy.mockResolvedValue(500);

      // Execute
      await (service as any).checkTimeframeLimit(
        'user123',
        'client123',
        'day',
        1000,
      );

      // Verify
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      expect(getUsageInTimeframeSpy).toHaveBeenCalledWith(
        'user123',
        'client123',
        dayAgo,
        now,
      );

      vi.useRealTimers();
    });
  });

  describe('getUsageInTimeframe', () => {
    it('should sum request counts from all records in timeframe', async () => {
      // Setup
      const startTime = new Date('2023-01-01T00:00:00Z');
      const endTime = new Date('2023-01-01T01:00:00Z');

      vi.mocked(db.aIRateLimitUsage.findMany).mockResolvedValue([
        {
          id: 'usage1',
          userId: 'user123',
          clientId: 'client123',
          timestamp: new Date(),
          requestCount: 5,
        },
        {
          id: 'usage2',
          userId: 'user123',
          clientId: 'client123',
          timestamp: new Date(),
          requestCount: 10,
        },
        {
          id: 'usage3',
          userId: 'user123',
          clientId: 'client123',
          timestamp: new Date(),
          requestCount: 3,
        },
      ]);

      // Execute
      const result = await (service as any).getUsageInTimeframe(
        'user123',
        'client123',
        startTime,
        endTime,
      );

      // Verify
      expect(result).toBe(18); // 5 + 10 + 3
      expect(db.aIRateLimitUsage.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user123',
          clientId: 'client123',
          timestamp: {
            gte: startTime,
            lte: endTime,
          },
        },
        select: {
          requestCount: true,
        },
      });
    });

    it('should return 0 when no records found', async () => {
      // Setup
      const startTime = new Date('2023-01-01T00:00:00Z');
      const endTime = new Date('2023-01-01T01:00:00Z');

      vi.mocked(db.aIRateLimitUsage.findMany).mockResolvedValue([]);

      // Execute
      const result = await (service as any).getUsageInTimeframe(
        'user123',
        'client123',
        startTime,
        endTime,
      );

      // Verify
      expect(result).toBe(0);
    });
  });

  describe('getRateLimitConfig', () => {
    it('should return client config when found', async () => {
      // Setup
      const config = {
        id: 'limit1',
        clientId: 'client123',
        clientName: 'Test Client',
        requestsPerMinute: 15,
        requestsPerHour: 150,
        requestsPerDay: 1500,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.aIRateLimit.findUnique).mockResolvedValue(config);

      // Execute
      const result = await (service as any).getRateLimitConfig('client123');

      // Verify
      expect(result).toEqual(config);
      expect(db.aIRateLimit.findUnique).toHaveBeenCalledWith({
        where: { clientId: 'client123' },
        select: {
          requestsPerMinute: true,
          requestsPerHour: true,
          requestsPerDay: true,
        },
      });
    });

    it('should return default config when not found', async () => {
      // Setup
      vi.mocked(db.aIRateLimit.findUnique).mockResolvedValue(null);

      // Execute
      const result = await (service as any).getRateLimitConfig('client123');

      // Verify
      expect(result).toEqual({
        requestsPerMinute: 5,
        requestsPerHour: 100,
        requestsPerDay: 1000,
      });
    });
  });
});
