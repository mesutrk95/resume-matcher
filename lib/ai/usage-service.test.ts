import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AIUsageService, TOKEN_LIMITS } from './usage-service';
import { db } from '@/lib/db';
import Logger from '@/lib/logger';
import { SubscriptionStatus } from '@prisma/client';

// Mock the database and logger
vi.mock('@/lib/db', () => ({
  db: {
    aIUsage: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    subscription: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/logger', () => ({
  default: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AIUsageService', () => {
  let service: AIUsageService;
  const originalEnv = process.env;

  beforeEach(() => {
    service = new AIUsageService();
    // Reset mocks before each test
    vi.resetAllMocks();
    // Mock environment variables
    vi.stubEnv('NODE_ENV', 'production'); // Default to production for tests
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('checkAndRecordIntent', () => {
    it('should allow requests when user has enough tokens', async () => {
      // Setup
      vi.mocked(db.subscription.findUnique).mockResolvedValue({
        id: 'sub1',
        userId: 'user123',
        customerId: 'cus_123',
        subscriptionId: 'sub_123',
        priceId: 'price_123',
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(db.aIUsage.findFirst).mockResolvedValue({
        id: 'usage1',
        userId: 'user123',
        promptTokens: 40000,
        completionTokens: 60000,
        totalTokens: 100000, // 100k tokens used
        requestCount: 50,
        failedRequestCount: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Execute - requesting 50k more tokens (total would be 150k, below 500k limit for ACTIVE)
      const result = await service.checkAndRecordIntent('user123', 50000);

      // Verify
      expect(result).toBe(true);
      expect(db.subscription.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user123' },
        select: { status: true },
      });
    });

    it('should deny requests when user exceeds token limit', async () => {
      // Setup
      vi.mocked(db.subscription.findUnique).mockResolvedValue({
        id: 'sub1',
        userId: 'user123',
        customerId: 'cus_123',
        subscriptionId: 'sub_123',
        priceId: 'price_123',
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(db.aIUsage.findFirst).mockResolvedValue({
        id: 'usage1',
        userId: 'user123',
        promptTokens: 200000,
        completionTokens: 250000,
        totalTokens: 450000, // 450k tokens used
        requestCount: 200,
        failedRequestCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Execute - requesting 100k more tokens (total would be 550k, above 500k limit for ACTIVE)
      const result = await service.checkAndRecordIntent('user123', 100000);

      // Verify
      expect(result).toBe(false);
      expect(Logger.warn).toHaveBeenCalledWith('User user123 exceeded token limit: 450000/500000', {
        estimatedRequest: 100000,
      });
    });

    it('should use FREE tier limit when user has no subscription', async () => {
      // Setup
      vi.mocked(db.subscription.findUnique).mockResolvedValue(null);

      vi.mocked(db.aIUsage.findFirst).mockResolvedValue({
        id: 'usage1',
        userId: 'user123',
        promptTokens: 15000,
        completionTokens: 25000,
        totalTokens: 40000, // 40k tokens used
        requestCount: 30,
        failedRequestCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Execute - requesting 20k more tokens (total would be 60k, above 50k FREE limit)
      const result = await service.checkAndRecordIntent('user123', 20000);

      // Verify
      expect(result).toBe(false);
      expect(Logger.warn).toHaveBeenCalledWith('User user123 exceeded token limit: 40000/50000', {
        estimatedRequest: 20000,
      });
    });

    it('should use 0 for current usage when no usage record exists', async () => {
      // Setup
      vi.mocked(db.subscription.findUnique).mockResolvedValue({
        id: 'sub1',
        userId: 'user123',
        customerId: 'cus_123',
        subscriptionId: 'sub_123',
        priceId: 'price_123',
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(db.aIUsage.findFirst).mockResolvedValue(null);

      // Execute - requesting 100k tokens (below 500k ACTIVE limit)
      const result = await service.checkAndRecordIntent('user123', 100000);

      // Verify
      expect(result).toBe(true);
    });

    it('should allow requests when an error occurs and log the error', async () => {
      // Setup
      const error = new Error('Database error');
      vi.mocked(db.subscription.findUnique).mockRejectedValue(error);

      // Execute
      const result = await service.checkAndRecordIntent('user123', 1000);

      // Verify
      expect(result).toBe(true);
      expect(Logger.error).toHaveBeenCalledWith('Error checking token usage for user user123', {
        error,
      });
    });
  });

  describe('recordUsage', () => {
    it('should update existing record when found', async () => {
      // Setup
      const now = new Date();
      vi.useFakeTimers();
      vi.setSystemTime(now);

      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      const existingRecord = {
        id: 'usage1',
        userId: 'user123',
        promptTokens: 1000,
        completionTokens: 500,
        totalTokens: 1500,
        requestCount: 5,
        failedRequestCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.aIUsage.findFirst).mockResolvedValue(existingRecord);

      // Execute
      await service.recordUsage('user123', 200, 100);

      // Verify
      expect(db.aIUsage.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'user123',
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      expect(db.aIUsage.update).toHaveBeenCalledWith({
        where: { id: 'usage1' },
        data: {
          promptTokens: 1200, // 1000 + 200
          completionTokens: 600, // 500 + 100
          totalTokens: 1800, // 1500 + 300
          requestCount: 6, // 5 + 1
        },
      });

      expect(db.aIUsage.create).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should create new record when not found', async () => {
      // Setup
      const now = new Date();
      vi.useFakeTimers();
      vi.setSystemTime(now);

      vi.mocked(db.aIUsage.findFirst).mockResolvedValue(null);

      // Execute
      await service.recordUsage('user123', 200, 100);

      // Verify
      expect(db.aIUsage.create).toHaveBeenCalledWith({
        data: {
          userId: 'user123',
          promptTokens: 200,
          completionTokens: 100,
          totalTokens: 300,
          requestCount: 1,
          failedRequestCount: 0,
        },
      });

      expect(db.aIUsage.update).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should log error but continue execution when an error occurs', async () => {
      // Setup
      const error = new Error('Database error');
      vi.mocked(db.aIUsage.findFirst).mockRejectedValue(error);

      // Execute
      await service.recordUsage('user123', 200, 100);

      // Verify
      expect(Logger.error).toHaveBeenCalledWith('Error recording token usage for user user123', {
        error,
      });
    });
  });

  describe('recordFailedAttempt', () => {
    it('should update existing record when found', async () => {
      // Setup
      const now = new Date();
      vi.useFakeTimers();
      vi.setSystemTime(now);

      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      const existingRecord = {
        id: 'usage1',
        userId: 'user123',
        promptTokens: 1000,
        completionTokens: 500,
        totalTokens: 1500,
        requestCount: 5,
        failedRequestCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.aIUsage.findFirst).mockResolvedValue(existingRecord);

      // Execute
      await service.recordFailedAttempt('user123');

      // Verify
      expect(db.aIUsage.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'user123',
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      expect(db.aIUsage.update).toHaveBeenCalledWith({
        where: { id: 'usage1' },
        data: {
          failedRequestCount: 2, // 1 + 1
        },
      });

      expect(db.aIUsage.create).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should create new record when not found', async () => {
      // Setup
      const now = new Date();
      vi.useFakeTimers();
      vi.setSystemTime(now);

      vi.mocked(db.aIUsage.findFirst).mockResolvedValue(null);

      // Execute
      await service.recordFailedAttempt('user123');

      // Verify
      expect(db.aIUsage.create).toHaveBeenCalledWith({
        data: {
          userId: 'user123',
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          requestCount: 0,
          failedRequestCount: 1,
        },
      });

      expect(db.aIUsage.update).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should log error but continue execution when an error occurs', async () => {
      // Setup
      const error = new Error('Database error');
      vi.mocked(db.aIUsage.findFirst).mockRejectedValue(error);

      // Execute
      await service.recordFailedAttempt('user123');

      // Verify
      expect(Logger.error).toHaveBeenCalledWith('Error recording failed attempt for user user123', {
        error,
      });
    });
  });

  describe('getUserUsageStats', () => {
    it('should return daily usage statistics', async () => {
      // Setup
      const now = new Date();
      vi.useFakeTimers();
      vi.setSystemTime(now);

      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);

      const usageRecords = [
        {
          id: 'usage1',
          userId: 'user123',
          promptTokens: 1000,
          completionTokens: 500,
          totalTokens: 1500,
          requestCount: 5,
          failedRequestCount: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'usage2',
          userId: 'user123',
          promptTokens: 2000,
          completionTokens: 1000,
          totalTokens: 3000,
          requestCount: 10,
          failedRequestCount: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.aIUsage.findMany).mockResolvedValue(usageRecords);
      vi.mocked(db.subscription.findUnique).mockResolvedValue({
        id: 'sub1',
        userId: 'user123',
        customerId: 'cus_123',
        subscriptionId: 'sub_123',
        priceId: 'price_123',
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Execute
      const result = await service.getUserUsageStats('user123', 'daily');

      // Verify
      expect(db.aIUsage.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user123',
          createdAt: {
            gte: startOfDay,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(result).toEqual({
        promptTokens: 3000, // 1000 + 2000
        completionTokens: 1500, // 500 + 1000
        totalTokens: 4500, // 1500 + 3000
        requestCount: 15, // 5 + 10
        failedRequestCount: 3, // 1 + 2
        startDate: startOfDay,
        endDate: now,
        timeframe: 'daily',
        isDevelopment: false,
        tokenLimit: TOKEN_LIMITS.BASIC, // 500,000 for ACTIVE subscription
        tokenUsagePercent: 1, // (4500 / 500000) * 100 = 0.9% rounded to 1%
        remainingTokens: 495500, // 500000 - 4500
      });

      vi.useRealTimers();
    });

    it('should return monthly usage statistics', async () => {
      // Setup
      const now = new Date();
      vi.useFakeTimers();
      vi.setSystemTime(now);

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const usageRecords = [
        {
          id: 'usage1',
          userId: 'user123',
          promptTokens: 10000,
          completionTokens: 5000,
          totalTokens: 15000,
          requestCount: 50,
          failedRequestCount: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'usage2',
          userId: 'user123',
          promptTokens: 20000,
          completionTokens: 10000,
          totalTokens: 30000,
          requestCount: 100,
          failedRequestCount: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.aIUsage.findMany).mockResolvedValue(usageRecords);
      vi.mocked(db.subscription.findUnique).mockResolvedValue({
        id: 'sub1',
        userId: 'user123',
        customerId: 'cus_123',
        subscriptionId: 'sub_123',
        priceId: 'price_123',
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Execute
      const result = await service.getUserUsageStats('user123', 'monthly');

      // Verify
      expect(db.aIUsage.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user123',
          createdAt: {
            gte: startOfMonth,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(result).toEqual({
        promptTokens: 30000, // 10000 + 20000
        completionTokens: 15000, // 5000 + 10000
        totalTokens: 45000, // 15000 + 30000
        requestCount: 150, // 50 + 100
        failedRequestCount: 15, // 5 + 10
        startDate: startOfMonth,
        endDate: now,
        timeframe: 'monthly',
        isDevelopment: false,
        tokenLimit: TOKEN_LIMITS.BASIC, // 500,000 for ACTIVE subscription
        tokenUsagePercent: 9, // (45000 / 500000) * 100 = 9%
        remainingTokens: 455000, // 500000 - 45000
      });

      vi.useRealTimers();
    });

    it('should throw error when an error occurs', async () => {
      // Setup
      const error = new Error('Database error');
      vi.mocked(db.aIUsage.findMany).mockRejectedValue(error);

      // Execute & Verify
      await expect(service.getUserUsageStats('user123')).rejects.toThrow(error);
      expect(Logger.error).toHaveBeenCalledWith('Error getting usage stats for user user123', {
        error,
      });
    });
  });

  describe('getTokenLimitForUser', () => {
    it('should return FREE limit when no subscription status is provided', () => {
      // Execute
      const result = (service as any).getTokenLimitForUser();

      // Verify
      expect(result).toBe(TOKEN_LIMITS.FREE);
    });

    it('should return BASIC limit for ACTIVE subscription', () => {
      // Execute
      const result = (service as any).getTokenLimitForUser(SubscriptionStatus.ACTIVE);

      // Verify
      expect(result).toBe(TOKEN_LIMITS.BASIC);
    });

    it('should return BASIC limit for TRIALING subscription', () => {
      // Execute
      const result = (service as any).getTokenLimitForUser(SubscriptionStatus.TRIALING);

      // Verify
      expect(result).toBe(TOKEN_LIMITS.BASIC);
    });

    it('should return FREE limit for CANCELED subscription', () => {
      // Execute
      const result = (service as any).getTokenLimitForUser(SubscriptionStatus.CANCELED);

      // Verify
      expect(result).toBe(TOKEN_LIMITS.FREE);
    });

    it('should return FREE limit for other subscription statuses', () => {
      // Execute
      const result1 = (service as any).getTokenLimitForUser(SubscriptionStatus.INCOMPLETE);
      const result2 = (service as any).getTokenLimitForUser(SubscriptionStatus.INCOMPLETE_EXPIRED);
      const result3 = (service as any).getTokenLimitForUser(SubscriptionStatus.PAST_DUE);
      const result4 = (service as any).getTokenLimitForUser(SubscriptionStatus.UNPAID);

      // Verify
      expect(result1).toBe(TOKEN_LIMITS.FREE);
      expect(result2).toBe(TOKEN_LIMITS.FREE);
      expect(result3).toBe(TOKEN_LIMITS.FREE);
      expect(result4).toBe(TOKEN_LIMITS.FREE);
    });
  });
});
