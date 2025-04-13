import { db } from '@/lib/db';
import Logger from '@/lib/logger';

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Default rate limits if not specified in the database
const DEFAULT_RATE_LIMITS = {
  REQUESTS_PER_MINUTE: 5,
  REQUESTS_PER_HOUR: 100,
  REQUESTS_PER_DAY: 1000,
};

/**
 * Service to handle rate limiting for AI requests
 */
export class AIRateLimitService {
  /**
   * Check if a user has exceeded their rate limit for a specific client
   */
  async checkRateLimit(
    userId: string,
    clientId: string,
  ): Promise<{ allowed: boolean; reason?: string }> {
    // In development, skip rate limiting if configured to do so
    if (isDevelopment && process.env.DISABLE_RATE_LIMITING === 'true') {
      return { allowed: true };
    }

    try {
      // Get rate limit configuration for this client
      const rateLimitConfig = await this.getRateLimitConfig(clientId);

      // Check minute limit
      const minuteExceeded = await this.checkTimeframeLimit(
        userId,
        clientId,
        'minute',
        rateLimitConfig.requestsPerMinute,
      );
      if (minuteExceeded) {
        return {
          allowed: false,
          reason: `Rate limit exceeded: ${rateLimitConfig.requestsPerMinute} requests per minute`,
        };
      }

      // Check hour limit
      const hourExceeded = await this.checkTimeframeLimit(
        userId,
        clientId,
        'hour',
        rateLimitConfig.requestsPerHour,
      );
      if (hourExceeded) {
        return {
          allowed: false,
          reason: `Rate limit exceeded: ${rateLimitConfig.requestsPerHour} requests per hour`,
        };
      }

      // Check day limit
      const dayExceeded = await this.checkTimeframeLimit(
        userId,
        clientId,
        'day',
        rateLimitConfig.requestsPerDay,
      );
      if (dayExceeded) {
        return {
          allowed: false,
          reason: `Rate limit exceeded: ${rateLimitConfig.requestsPerDay} requests per day`,
        };
      }

      return { allowed: true };
    } catch (error) {
      Logger.error(`Error checking rate limit for user ${userId}`, { error });
      // Default to allowing the request if we can't check the limit
      return { allowed: true };
    }
  }

  /**
   * Record a request for rate limiting purposes
   */
  async recordRequest(userId: string, clientId: string): Promise<void> {
    try {
      const now = new Date();

      // Create minute-level timestamp (truncate to minute)
      const minuteTimestamp = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
      );

      // Find or create rate limit usage record
      const existingRecord = await db.aIRateLimitUsage.findUnique({
        where: {
          userId_clientId_timestamp: {
            userId,
            clientId,
            timestamp: minuteTimestamp,
          },
        },
      });

      if (existingRecord) {
        // Update existing record
        await db.aIRateLimitUsage.update({
          where: {
            id: existingRecord.id,
          },
          data: {
            requestCount: existingRecord.requestCount + 1,
          },
        });
      } else {
        // Create new record
        await db.aIRateLimitUsage.create({
          data: {
            userId,
            clientId,
            timestamp: minuteTimestamp,
            requestCount: 1,
          },
        });
      }
    } catch (error) {
      Logger.error(`Error recording rate limit usage for user ${userId}`, {
        error,
      });
      // Continue execution even if recording fails
    }
  }

  /**
   * Get rate limit statistics for a user and client
   */
  async getRateLimitStats(
    userId: string,
    clientId: string,
  ): Promise<{
    minuteUsage: number;
    hourUsage: number;
    dayUsage: number;
    limits: {
      requestsPerMinute: number;
      requestsPerHour: number;
      requestsPerDay: number;
    };
  }> {
    try {
      const now = new Date();

      // Calculate timeframes
      const minuteAgo = new Date(now.getTime() - 60 * 1000);
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get usage for each timeframe
      const minuteUsage = await this.getUsageInTimeframe(userId, clientId, minuteAgo, now);
      const hourUsage = await this.getUsageInTimeframe(userId, clientId, hourAgo, now);
      const dayUsage = await this.getUsageInTimeframe(userId, clientId, dayAgo, now);

      // Get rate limit configuration
      const limits = await this.getRateLimitConfig(clientId);

      return {
        minuteUsage,
        hourUsage,
        dayUsage,
        limits,
      };
    } catch (error) {
      Logger.error(`Error getting rate limit stats for user ${userId}`, {
        error,
      });
      throw error;
    }
  }

  /**
   * Check if a user has exceeded their rate limit for a specific timeframe
   */
  private async checkTimeframeLimit(
    userId: string,
    clientId: string,
    timeframe: 'minute' | 'hour' | 'day',
    limit: number,
  ): Promise<boolean> {
    const now = new Date();
    let timeAgo: Date;

    // Calculate the start time based on timeframe
    switch (timeframe) {
      case 'minute':
        timeAgo = new Date(now.getTime() - 60 * 1000);
        break;
      case 'hour':
        timeAgo = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'day':
        timeAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
    }

    // Get usage in the timeframe
    const usage = await this.getUsageInTimeframe(userId, clientId, timeAgo, now);

    // Check if usage exceeds limit
    return usage >= limit;
  }

  /**
   * Get usage count in a specific timeframe
   */
  private async getUsageInTimeframe(
    userId: string,
    clientId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<number> {
    const records = await db.aIRateLimitUsage.findMany({
      where: {
        userId,
        clientId,
        timestamp: {
          gte: startTime,
          lte: endTime,
        },
      },
      select: {
        requestCount: true,
      },
    });

    return records.reduce((total, record) => total + record.requestCount, 0);
  }

  /**
   * Get rate limit configuration for a client
   */
  private async getRateLimitConfig(clientId: string): Promise<{
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  }> {
    // Try to get configuration from database
    const config = await db.aIRateLimit.findUnique({
      where: { clientId },
      select: {
        requestsPerMinute: true,
        requestsPerHour: true,
        requestsPerDay: true,
      },
    });

    // If configuration exists, return it
    if (config) {
      return config;
    }

    // Otherwise, return default configuration
    return {
      requestsPerMinute: DEFAULT_RATE_LIMITS.REQUESTS_PER_MINUTE,
      requestsPerHour: DEFAULT_RATE_LIMITS.REQUESTS_PER_HOUR,
      requestsPerDay: DEFAULT_RATE_LIMITS.REQUESTS_PER_DAY,
    };
  }
}
