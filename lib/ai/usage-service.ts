import { db } from '@/lib/db';
import Logger from '@/lib/logger';
import { SubscriptionStatus } from '@prisma/client';

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Constants for token limits based on subscription tier
 */
export const TOKEN_LIMITS = {
  FREE: 50_000,
  BASIC: 500_000,
  // Unlimited for development
  DEV: Number.MAX_SAFE_INTEGER,
};

/**
 * Timeframes for token quotas
 */
export type UsageTimeframe = 'daily' | 'monthly';

/**
 * Service to track and manage AI token usage per user
 */
export class AIUsageService {
  /**
   * Check if a user has enough tokens for their intended request
   * and record their intent to use tokens
   */
  async checkAndRecordIntent(
    userId: string,
    estimatedTokens: number,
  ): Promise<boolean> {
    // In development, always allow requests
    if (isDevelopment) {
      return true;
    }

    try {
      // Get user's subscription status
      const subscription = await db.subscription.findUnique({
        where: { userId },
        select: { status: true },
      });

      // Determine token limit based on subscription
      const tokenLimit = this.getTokenLimitForUser(subscription?.status);

      // Get today's usage
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const todaysUsage = await db.aIUsage.findFirst({
        where: {
          userId,
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        select: {
          totalTokens: true,
        },
      });

      const currentUsage = todaysUsage?.totalTokens || 0;

      // Check if the request would exceed the limit
      if (currentUsage + estimatedTokens > tokenLimit) {
        Logger.warn(
          `User ${userId} exceeded token limit: ${currentUsage}/${tokenLimit}`,
          {
            estimatedRequest: estimatedTokens,
          },
        );
        return false;
      }

      return true;
    } catch (error) {
      Logger.error(`Error checking token usage for user ${userId}`, { error });
      // Default to allowing the request if we can't check the limit
      return true;
    }
  }

  /**
   * Record actual token usage after a successful request
   */
  async recordUsage(
    userId: string,
    promptTokens: number,
    completionTokens: number,
  ): Promise<void> {
    try {
      // Still record usage in development mode for analytics,
      // but it won't count against limits
      const totalTokens = promptTokens + completionTokens;

      // Get today's record if it exists
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const todaysRecord = await db.aIUsage.findFirst({
        where: {
          userId,
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      if (todaysRecord) {
        // Update existing record
        await db.aIUsage.update({
          where: { id: todaysRecord.id },
          data: {
            promptTokens: todaysRecord.promptTokens + promptTokens,
            completionTokens: todaysRecord.completionTokens + completionTokens,
            totalTokens: todaysRecord.totalTokens + totalTokens,
            requestCount: todaysRecord.requestCount + 1,
          },
        });
      } else {
        // Create new record
        await db.aIUsage.create({
          data: {
            userId,
            promptTokens,
            completionTokens,
            totalTokens,
            requestCount: 1,
            failedRequestCount: 0,
          },
        });
      }
    } catch (error) {
      Logger.error(`Error recording token usage for user ${userId}`, { error });
      // Continue execution even if recording fails
    }
  }

  /**
   * Record a failed request attempt
   */
  async recordFailedAttempt(userId: string): Promise<void> {
    try {
      // Get today's record if it exists
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const todaysRecord = await db.aIUsage.findFirst({
        where: {
          userId,
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      if (todaysRecord) {
        // Update existing record
        await db.aIUsage.update({
          where: { id: todaysRecord.id },
          data: {
            failedRequestCount: todaysRecord.failedRequestCount + 1,
          },
        });
      } else {
        // Create new record
        await db.aIUsage.create({
          data: {
            userId,
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            requestCount: 0,
            failedRequestCount: 1,
          },
        });
      }
    } catch (error) {
      Logger.error(`Error recording failed attempt for user ${userId}`, {
        error,
      });
      // Continue execution even if recording fails
    }
  }

  /**
   * Get user's token usage statistics
   */
  async getUserUsageStats(
    userId: string,
    timeframe: UsageTimeframe = 'daily',
  ): Promise<any> {
    try {
      let startDate: Date;
      const now = new Date();

      if (timeframe === 'daily') {
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
      } else {
        // monthly
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const usage = await db.aIUsage.findMany({
        where: {
          userId,
          createdAt: {
            gte: startDate,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Calculate totals
      const stats = {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        requestCount: 0,
        failedRequestCount: 0,
        startDate,
        endDate: now,
        timeframe,
        isDevelopment,
        tokenLimit: 0,
        tokenUsagePercent: 0,
        remainingTokens: 0,
      };

      for (const record of usage) {
        stats.promptTokens += record.promptTokens;
        stats.completionTokens += record.completionTokens;
        stats.totalTokens += record.totalTokens;
        stats.requestCount += record.requestCount;
        stats.failedRequestCount += record.failedRequestCount;
      }

      // Add remaining quota info
      const subscription = await db.subscription.findUnique({
        where: { userId },
        select: { status: true },
      });

      const tokenLimit = this.getTokenLimitForUser(subscription?.status);
      stats.tokenLimit = tokenLimit;
      stats.tokenUsagePercent = isDevelopment
        ? 0
        : Math.round((stats.totalTokens / tokenLimit) * 100);
      stats.remainingTokens = isDevelopment
        ? TOKEN_LIMITS.DEV
        : Math.max(0, tokenLimit - stats.totalTokens);

      return stats;
    } catch (error) {
      Logger.error(`Error getting usage stats for user ${userId}`, { error });
      throw error;
    }
  }

  /**
   * Get token limit based on subscription status
   */
  private getTokenLimitForUser(
    subscriptionStatus?: SubscriptionStatus | null,
  ): number {
    // In development, always use unlimited tokens
    if (isDevelopment) {
      return TOKEN_LIMITS.DEV;
    }

    if (!subscriptionStatus) return TOKEN_LIMITS.FREE;

    switch (subscriptionStatus) {
      case SubscriptionStatus.ACTIVE:
      case SubscriptionStatus.TRIALING:
        return TOKEN_LIMITS.BASIC;
      case SubscriptionStatus.CANCELED:
      case SubscriptionStatus.INCOMPLETE:
      case SubscriptionStatus.INCOMPLETE_EXPIRED:
      case SubscriptionStatus.PAST_DUE:
      case SubscriptionStatus.UNPAID:
      default:
        return TOKEN_LIMITS.FREE;
    }
  }
}
