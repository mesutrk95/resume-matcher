'use server';

import { db } from '@/lib/db';
import { getStripeServer } from '@/lib/stripe';
import { SubscriptionStatus } from '@prisma/client';
import { mapStripeStatusToDBStatus } from './constants';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@/lib/exceptions';

export const cleanupAbandonedSubscriptions = async (userId: string) => {
  if (!userId) {
    throw new BadRequestException('User ID is required');
  }

  const stripe = getStripeServer();
  if (!stripe) {
    throw new InternalServerErrorException('Failed to initialize Stripe');
  }

  const subscription = await db.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) return null;

  if (subscription.customerId && !subscription.subscriptionId) {
    const requestId = `cleanup-${userId.substring(0, 6)}`;

    // Get subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: subscription.customerId,
      status: 'all',
    });

    if (subscriptions.data.length === 0) {
      await db.subscription.update({
        where: { userId },
        data: {
          status: SubscriptionStatus.CANCELED,
        },
      });
    } else {
      const latestSubscription = subscriptions.data[0];
      await db.subscription.update({
        where: { userId },
        data: {
          subscriptionId: latestSubscription.id,
          status: mapStripeStatusToDBStatus(latestSubscription.status),
          currentPeriodStart: new Date(
            latestSubscription.current_period_start * 1000,
          ),
          currentPeriodEnd: new Date(
            latestSubscription.current_period_end * 1000,
          ),
          cancelAtPeriodEnd: latestSubscription.cancel_at_period_end,
        },
      });
    }
  }

  return await db.subscription.findUnique({
    where: { userId },
  });
};
