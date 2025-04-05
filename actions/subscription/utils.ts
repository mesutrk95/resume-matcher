'use server';

import { db } from '@/lib/db';
import { SubscriptionStatus } from '@prisma/client';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@/lib/exceptions';
import Logger from '@/lib/logger';
import { currentUser } from '@/lib/auth';

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
    throw new BadRequestException('User ID is required');
  }

  if (!subscriptionId) {
    throw new BadRequestException('Subscription ID is required');
  }

  try {
    return await db.subscription.upsert({
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
  } catch (error: any) {
    Logger.error('Failed to update subscription in database', {
      userId,
      subscriptionId,
      error: error.message,
    });
    throw new InternalServerErrorException(
      'Failed to update subscription in database',
    );
  }
};

export const getCustomerById = async (customerId: string) => {
  if (!customerId) {
    throw new BadRequestException('Customer ID is required');
  }

  const stripe = (await import('@/lib/stripe')).getStripeServer();
  if (!stripe) {
    throw new InternalServerErrorException('Stripe not initialized');
  }

  try {
    return await stripe.customers.retrieve(customerId);
  } catch (error: any) {
    Logger.error('Error retrieving customer', {
      customerId,
      error: error.message,
    });
    throw new InternalServerErrorException(
      `Failed to retrieve customer: ${error.message}`,
    );
  }
};

export async function checkTrialEligibility() {
  const user = await currentUser();
  if (!user?.id) return false;

  const subscriptionCount = await db.subscription.count({
    where: {
      userId: user.id,
      subscriptionId: { not: null },
    },
  });

  return subscriptionCount === 0;
}
