'use server';

import { db } from '@/lib/db';
import { getStripeServer } from '@/lib/stripe';
import { SubscriptionStatus } from '@prisma/client';
import { mapStripeStatusToDBStatus } from './constants';

export const cleanupAbandonedSubscriptions = async (userId: string) => {
  const stripe = getStripeServer();
  if (!stripe) {
    throw new Error('Failed to initialize Stripe');
  }

  const subscription = await db.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) return null;

  // If we have a customerId but no subscriptionId, this might be an abandoned checkout
  if (subscription.customerId && !subscription.subscriptionId) {
    try {
      // Check if customer has any active subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: subscription.customerId,
        status: 'all',
      });

      if (subscriptions.data.length === 0) {
        // If no subscriptions found, update the local status
        await db.subscription.update({
          where: { userId },
          data: {
            status: SubscriptionStatus.CANCELED,
          },
        });
      } else {
        // Found subscriptions, update with the latest one
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
    } catch (error) {
      console.error('Error cleaning up abandoned subscription:', error);
    }
  }

  return await db.subscription.findUnique({
    where: { userId },
  });
};
