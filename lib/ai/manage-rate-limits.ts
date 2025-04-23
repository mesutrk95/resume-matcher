import { db } from '@/lib/db';
import Logger from '@/lib/logger';

/**
 * Get rate limits for all clients
 */
export async function getAllRateLimits() {
  try {
    return await db.aIRateLimit.findMany({
      orderBy: {
        clientName: 'asc',
      },
    });
  } catch (error) {
    Logger.error('Error getting all rate limits', { error });
    throw error;
  }
}

/**
 * Get rate limits for a specific client
 */
export async function getClientRateLimits(clientId: string) {
  try {
    return await db.aIRateLimit.findUnique({
      where: { clientId },
    });
  } catch (error) {
    Logger.error(`Error getting rate limits for client ${clientId}`, { error });
    throw error;
  }
}

/**
 * Set rate limits for a client
 */
export async function setClientRateLimits(
  clientId: string,
  limits: {
    requestsPerMinute?: number;
    requestsPerHour?: number;
    requestsPerDay?: number;
  },
) {
  try {
    const existingLimits = await db.aIRateLimit.findUnique({
      where: { clientId },
    });

    if (existingLimits) {
      // Update existing limits
      return await db.aIRateLimit.update({
        where: { clientId },
        data: {
          requestsPerMinute: limits.requestsPerMinute ?? existingLimits.requestsPerMinute,
          requestsPerHour: limits.requestsPerHour ?? existingLimits.requestsPerHour,
          requestsPerDay: limits.requestsPerDay ?? existingLimits.requestsPerDay,
        },
      });
    } else {
      throw new Error(`Client ${clientId} not found`);
    }
  } catch (error) {
    Logger.error(`Error setting rate limits for client ${clientId}`, { error });
    throw error;
  }
}

/**
 * Get rate limit usage for a user and client
 */
export async function getUserRateLimitUsage(userId: string, clientId: string) {
  try {
    const now = new Date();

    // Calculate timeframes
    const minuteAgo = new Date(now.getTime() - 60 * 1000);
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get usage for each timeframe
    const minuteUsage = await getUsageInTimeframe(userId, clientId, minuteAgo, now);
    const hourUsage = await getUsageInTimeframe(userId, clientId, hourAgo, now);
    const dayUsage = await getUsageInTimeframe(userId, clientId, dayAgo, now);

    // Get rate limit configuration
    const limits = await db.aIRateLimit.findUnique({
      where: { clientId },
    });

    return {
      minuteUsage,
      hourUsage,
      dayUsage,
      limits,
    };
  } catch (error) {
    Logger.error(`Error getting rate limit usage for user ${userId}`, {
      error,
    });
    throw error;
  }
}

/**
 * Get usage count in a specific timeframe
 */
async function getUsageInTimeframe(
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
 * Clear rate limit usage for testing or administrative purposes
 */
export async function clearRateLimitUsage(userId: string, clientId?: string) {
  try {
    const where: any = { userId };

    if (clientId) {
      where.clientId = clientId;
    }

    await db.aIRateLimitUsage.deleteMany({
      where,
    });

    Logger.info(
      `Cleared rate limit usage for user ${userId}${clientId ? ` and client ${clientId}` : ''}`,
    );
  } catch (error) {
    Logger.error(`Error clearing rate limit usage for user ${userId}`, {
      error,
    });
    throw error;
  }
}
