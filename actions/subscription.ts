// actions/enhanced-subscription.ts
'use server';

import { currentUser } from '@/lib/auth';
import { response } from '@/lib/utils';
import {
  cancelSubscription,
  createCheckoutSession,
  getPortalSession,
  getSubscriptionByUserId,
  reactivateSubscription,
  verifyAndActivateSubscription,
} from '@/services/subscription';

// Define the subscription interval type
export type SubscriptionInterval =
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'biannual'
  | 'yearly';

// Map subscription intervals to Stripe price IDs
const PRICE_MAPPING: Record<SubscriptionInterval, string | undefined> = {
  weekly: process.env.STRIPE_BASIC_PRICE_WEEKLY,
  monthly: process.env.STRIPE_BASIC_PRICE_MONTHLY,
  quarterly: process.env.STRIPE_BASIC_PRICE_QUARTERLY,
  biannual: process.env.STRIPE_BASIC_PRICE_BIANNUAL,
  yearly: process.env.STRIPE_BASIC_PRICE_YEARLY,
};

// Create a new subscription
export const createSubscription = async (interval: SubscriptionInterval) => {
  const user = await currentUser();

  if (!user || !user.id || !user.email) {
    return {
      success: false,
      error: 'User not authenticated',
    };
  }

  const priceId = PRICE_MAPPING[interval];

  if (!priceId) {
    return {
      success: false,
      error: 'Invalid subscription interval',
    };
  }

  try {
    const session = await createCheckoutSession(
      user.id,
      user.email,
      priceId,
      user.name || undefined,
    );

    return {
      success: true,
      sessionId: session.id,
      url: session.url!,
    };
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return {
      success: false,
      error: error.message || 'Failed to create subscription',
    };
  }
};

// Verify and activate subscription from checkout session
export const verifySubscriptionFromSession = async (sessionId: string) => {
  try {
    const result = await verifyAndActivateSubscription(sessionId);
    return result;
  } catch (error: any) {
    console.error('Error verifying subscription:', error);
    return {
      success: false,
      error: error.message || 'Failed to verify subscription',
    };
  }
};

// Cancel user subscription
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

// Get current user subscription
export const getUserSubscription = async () => {
  const user = await currentUser();

  if (!user || !user.id) {
    throw new Error('User not authenticated');
  }

  const subscription = await getSubscriptionByUserId(user.id);

  return subscription;
};

// Create a billing portal session
export const createCustomerPortalSession = async () => {
  const user = await currentUser();

  if (!user || !user.id) {
    throw new Error('User not authenticated');
  }

  const session = await getPortalSession(user.id);

  return session.url;
};
