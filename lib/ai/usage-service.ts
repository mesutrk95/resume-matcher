import { db } from '@/lib/db';
import Logger from '@/lib/logger';
import { SubscriptionStatus } from '@prisma/client';
import { AI } from '@/lib/constants';

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Timeframes for token quotas
 */
export type UsageTimeframe = 'daily' | 'monthly';

//TODO replace this with redis
/**
 * Service to track and manage AI token usage per user
 */
export class AIUsageService {
  /**
   * Check if a user has enough tokens for their intended request
   * and record their intent to use tokens
   */
  async checkIntent(userId: string): Promise<boolean> {
    // In development, always allow requests
    if (isDevelopment) {
      return true;
    }

    try {
      //TODO: it can be cached in memory for a while
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
      if (currentUsage > tokenLimit) {
        Logger.warn(`User ${userId} exceeded token limit: ${currentUsage}/${tokenLimit}`);
        return false;
      }

      return true;
    } catch (error) {
      Logger.error(`Error checking token usage for user ${userId}`, { error });
      throw error;
    }
  }

  /**
   * Record actual token usage and response time after a successful request
   */
  async recordUsage(
    userId: string,
    clientId: string | undefined,
    promptTokens: number,
    completionTokens: number,
    responseTime: number,
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
            responseTime: todaysRecord.responseTime + responseTime,
            clientId: clientId ?? todaysRecord.clientId,
          } as any,
        });
      } else {
        // Create new record
        await db.aIUsage.create({
          data: {
            userId,
            clientId,
            promptTokens,
            completionTokens,
            totalTokens,
            requestCount: 1,
            failedRequestCount: 0,
            responseTime,
          } as any,
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
  async getUserUsageStats(userId: string, timeframe: UsageTimeframe = 'daily'): Promise<any> {
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
        ? AI.TOKEN_LIMITS.DEV
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
  private getTokenLimitForUser(subscriptionStatus?: SubscriptionStatus | null): number {
    // In development, always use unlimited tokens
    if (isDevelopment) {
      return AI.TOKEN_LIMITS.DEV;
    }

    if (!subscriptionStatus) return AI.TOKEN_LIMITS.FREE;

    switch (subscriptionStatus) {
      case SubscriptionStatus.ACTIVE:
      case SubscriptionStatus.TRIALING:
        return AI.TOKEN_LIMITS.BASIC;
      default:
        return AI.TOKEN_LIMITS.FREE;
    }
  }

  // Add a new method to record usage by reason
  async recordUsageByReason(
    userId: string,
    reason: string,
    clientId: string | undefined,
    promptTokens: number,
    completionTokens: number,
    responseTime: number,
  ): Promise<void> {
    try {
      const totalTokens = promptTokens + completionTokens;

      // Get today's date with time set to 00:00:00
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Try to find an existing record for this user, reason, and date
      const existingRecord = await db.aIUsageByReason.findUnique({
        where: {
          userId_reason_date: {
            userId,
            reason,
            date: today,
          },
        },
      });

      if (existingRecord) {
        // Update existing record
        await db.aIUsageByReason.update({
          where: { id: existingRecord.id },
          data: {
            promptTokens: existingRecord.promptTokens + promptTokens,
            completionTokens: existingRecord.completionTokens + completionTokens,
            totalTokens: existingRecord.totalTokens + totalTokens,
            requestCount: existingRecord.requestCount + 1,
            responseTime: existingRecord.responseTime + responseTime,
            clientId: clientId ?? existingRecord.clientId,
            updatedAt: new Date(),
          },
        });
      } else {
        // Create new record
        await db.aIUsageByReason.create({
          data: {
            userId,
            reason,
            clientId,
            promptTokens,
            completionTokens,
            totalTokens,
            requestCount: 1,
            failedRequestCount: 0,
            responseTime,
            date: today,
          },
        });
      }
    } catch (error) {
      Logger.error(`Error recording usage by reason for user ${userId}`, { error, reason });
      // Continue execution even if recording fails
    }
  }

  // Add a new method to record failed attempts by reason
  async recordFailedAttemptByReason(userId: string, reason: string): Promise<void> {
    try {
      // Get today's date with time set to 00:00:00
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Try to find an existing record
      const existingRecord = await db.aIUsageByReason.findUnique({
        where: {
          userId_reason_date: {
            userId,
            reason,
            date: today,
          },
        },
      });

      if (existingRecord) {
        // Update existing record
        await db.aIUsageByReason.update({
          where: { id: existingRecord.id },
          data: {
            failedRequestCount: existingRecord.failedRequestCount + 1,
            updatedAt: new Date(),
          },
        });
      } else {
        // Create new record
        await db.aIUsageByReason.create({
          data: {
            userId,
            reason,
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            requestCount: 0,
            failedRequestCount: 1,
            date: today,
          },
        });
      }
    } catch (error) {
      Logger.error(`Error recording failed attempt by reason for user ${userId}`, {
        error,
        reason,
      });
      // Continue execution even if recording fails
    }
  }

  // Method to get usage statistics by reason
  async getUserUsageStatsByReason(
    userId: string,
    reason?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    try {
      const now = new Date();
      const queryStartDate = startDate || new Date(now.getFullYear(), now.getMonth(), 1); // Default to start of current month
      const queryEndDate = endDate || now;

      const whereClause: any = {
        userId,
        date: {
          gte: queryStartDate,
          lte: queryEndDate,
        },
      };

      // Add reason filter if specified
      if (reason) {
        whereClause.reason = reason;
      }

      const usage = await db.aIUsageByReason.findMany({
        where: whereClause,
        orderBy: {
          date: 'asc',
        },
      });

      // Calculate totals and group by reason
      const reasonStats: Record<string, any> = {};
      let totalPromptTokens = 0;
      let totalCompletionTokens = 0;
      let totalTokens = 0;
      let totalRequests = 0;
      let totalFailedRequests = 0;
      let totalResponseTime = 0;

      for (const record of usage) {
        // Initialize stats for this reason if not exists
        if (!reasonStats[record.reason]) {
          reasonStats[record.reason] = {
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            requestCount: 0,
            failedRequestCount: 0,
            responseTime: 0,
          };
        }

        // Add to reason stats
        reasonStats[record.reason].promptTokens += record.promptTokens;
        reasonStats[record.reason].completionTokens += record.completionTokens;
        reasonStats[record.reason].totalTokens += record.totalTokens;
        reasonStats[record.reason].requestCount += record.requestCount;
        reasonStats[record.reason].failedRequestCount += record.failedRequestCount;
        reasonStats[record.reason].responseTime += record.responseTime;

        // Add to overall totals
        totalPromptTokens += record.promptTokens;
        totalCompletionTokens += record.completionTokens;
        totalTokens += record.totalTokens;
        totalRequests += record.requestCount;
        totalFailedRequests += record.failedRequestCount;
        totalResponseTime += record.responseTime;
      }

      return {
        byReason: reasonStats,
        totals: {
          promptTokens: totalPromptTokens,
          completionTokens: totalCompletionTokens,
          totalTokens,
          requestCount: totalRequests,
          failedRequestCount: totalFailedRequests,
          responseTime: totalResponseTime,
          averageResponseTime:
            totalRequests > 0 ? Math.round(totalResponseTime / totalRequests) : 0,
        },
        timeframe: {
          startDate: queryStartDate,
          endDate: queryEndDate,
        },
      };
    } catch (error) {
      Logger.error(`Error getting usage stats by reason for user ${userId}`, { error });
      throw error;
    }
  }
}
