import { db } from '@/lib/db';
import { AIModelClient } from './types';
import Logger from '@/lib/logger';

/**
 * Initialize rate limits for an AI model client
 * This function ensures that rate limits exist in the database for a given client
 */
export async function initializeRateLimits(
  client: AIModelClient,
  options?: {
    requestsPerMinute?: number;
    requestsPerHour?: number;
    requestsPerDay?: number;
  },
): Promise<void> {
  try {
    const clientId = client.getClientId();
    const clientName = client.getClientName();

    // Check if rate limits already exist for this client
    const existingLimits = await db.aIRateLimit.findUnique({
      where: { clientId },
    });

    if (!existingLimits) {
      // Create default rate limits
      await db.aIRateLimit.create({
        data: {
          clientId,
          clientName,
          requestsPerMinute: options?.requestsPerMinute ?? 5,
          requestsPerHour: options?.requestsPerHour ?? 100,
          requestsPerDay: options?.requestsPerDay ?? 1000,
        },
      });

      Logger.info(`Initialized rate limits for client ${clientName}`);
    }
  } catch (error) {
    Logger.error('Error initializing rate limits', { error });
    // Continue execution even if initialization fails
  }
}

/**
 * Update rate limits for an AI model client
 */
export async function updateRateLimits(
  clientId: string,
  options: {
    requestsPerMinute?: number;
    requestsPerHour?: number;
    requestsPerDay?: number;
  },
): Promise<void> {
  try {
    // Check if rate limits exist for this client
    const existingLimits = await db.aIRateLimit.findUnique({
      where: { clientId },
    });

    if (existingLimits) {
      // Update rate limits
      await db.aIRateLimit.update({
        where: { clientId },
        data: {
          requestsPerMinute: options.requestsPerMinute ?? existingLimits.requestsPerMinute,
          requestsPerHour: options.requestsPerHour ?? existingLimits.requestsPerHour,
          requestsPerDay: options.requestsPerDay ?? existingLimits.requestsPerDay,
        },
      });

      Logger.info(`Updated rate limits for client ${clientId}`);
    } else {
      Logger.warn(`Attempted to update rate limits for non-existent client ${clientId}`);
    }
  } catch (error) {
    Logger.error('Error updating rate limits', { error });
    throw error;
  }
}
