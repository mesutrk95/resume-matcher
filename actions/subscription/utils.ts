'use server';

import { db } from '@/lib/db';
import { SubscriptionStatus } from '@prisma/client';

// Update subscription in database
export const updateSubscriptionInDatabase = async (
  userId: string,
  subscriptionId: string,
  priceId: string,
  status: SubscriptionStatus,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd?: boolean,
) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    return db.subscription.upsert({
      where: { userId },
      update: {
        subscriptionId,
        priceId,
        status,
        currentPeriodStart,
        currentPeriodEnd,
        ...(cancelAtPeriodEnd !== undefined && { cancelAtPeriodEnd }),
        updatedAt: new Date(),
      },
      create: {
        userId,
        subscriptionId,
        priceId,
        status,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: cancelAtPeriodEnd || false,
      },
    });
  } catch (error) {
    console.error(`Error updating subscription in database:`, error);
    throw new Error('Failed to update subscription in database');
  }
};
