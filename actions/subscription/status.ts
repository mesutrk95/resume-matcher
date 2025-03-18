'use server';

import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getStripeServer } from '@/lib/stripe';
import { response } from '@/lib/utils';
import { getSubscriptionByUserId } from './customer';

// Cancel a subscription
export const cancelUserSubscription = async () => {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      return response({
        success: false,
        error: {
          code: 401,
          message: 'Unauthorized',
        },
      });
    }

    await cancelSubscription(user.id);

    return response({
      success: true,
      code: 200,
      message:
        'Subscription scheduled for cancellation at the end of the billing period',
    });
  } catch (error: any) {
    return response({
      success: false,
      error: {
        code: 500,
        message: error.message || 'Failed to cancel subscription',
      },
    });
  }
};

// Helper function to cancel a subscription
export const cancelSubscription = async (userId: string) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const subscription = await getSubscriptionByUserId(userId);

  if (!subscription?.subscriptionId) {
    throw new Error('No subscription found');
  }

  const stripe = getStripeServer();

  if (!stripe) {
    throw new Error('Failed to initialize Stripe');
  }

  try {
    // Cancel at period end
    await stripe.subscriptions.update(subscription.subscriptionId, {
      cancel_at_period_end: true,
    });

    // Update database
    return db.subscription.update({
      where: { userId },
      data: {
        cancelAtPeriodEnd: true,
      },
    });
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    throw new Error(`Failed to cancel subscription: ${error.message}`);
  }
};

// Reactivate a canceled subscription
export const reactivateUserSubscription = async () => {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      return response({
        success: false,
        error: {
          code: 401,
          message: 'Unauthorized',
        },
      });
    }

    await reactivateSubscription(user.id);

    return response({
      success: true,
      code: 200,
      message: 'Subscription reactivated successfully',
    });
  } catch (error: any) {
    return response({
      success: false,
      error: {
        code: 500,
        message: error.message || 'Failed to reactivate subscription',
      },
    });
  }
};

// Helper function to reactivate a subscription
export const reactivateSubscription = async (userId: string) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const subscription = await getSubscriptionByUserId(userId);

  if (!subscription?.subscriptionId) {
    throw new Error('No subscription found');
  }

  const stripe = getStripeServer();

  if (!stripe) {
    throw new Error('Failed to initialize Stripe');
  }

  try {
    // Cancel the cancellation
    await stripe.subscriptions.update(subscription.subscriptionId, {
      cancel_at_period_end: false,
    });

    // Update database
    return db.subscription.update({
      where: { userId },
      data: {
        cancelAtPeriodEnd: false,
      },
    });
  } catch (error: any) {
    console.error('Error reactivating subscription:', error);
    throw new Error(`Failed to reactivate subscription: ${error.message}`);
  }
};
