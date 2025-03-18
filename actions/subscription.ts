'use server';

import { currentUser } from '@/lib/auth';
import { response } from '@/lib/utils';
import {
  cancelSubscription,
  createCheckoutSession,
  getPortalSession,
  getSubscriptionByUserId,
  reactivateSubscription,
} from '@/services/subscription';

type SubscriptionInterval =
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'biannual'
  | 'yearly';

const PRICE_MAPPING: Record<SubscriptionInterval, string | undefined> = {
  weekly: process.env.STRIPE_BASIC_PRICE_WEEKLY,
  monthly: process.env.STRIPE_BASIC_PRICE_MONTHLY,
  quarterly: process.env.STRIPE_BASIC_PRICE_QUARTERLY,
  biannual: process.env.STRIPE_BASIC_PRICE_BIANNUAL,
  yearly: process.env.STRIPE_BASIC_PRICE_YEARLY,
};

export const createSubscription = async (interval: SubscriptionInterval) => {
  const user = await currentUser();
  const priceId = PRICE_MAPPING[interval];

  if (!priceId) {
    throw new Error('Invalid subscription interval');
  }

  const session = await createCheckoutSession(
    user?.id!,
    user?.email!,
    priceId,
    user?.name || undefined,
  );

  return {
    sessionId: session.id,
    url: session.url!,
  };
};

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

export const getUserSubscription = async () => {
  const user = await currentUser();

  const subscription = await getSubscriptionByUserId(user?.id!);
  if (!subscription) {
    throw new Error('No subscription found');
  }

  return subscription;
};

export const createCustomerPortalSession = async () => {
  const user = await currentUser();

  const session = await getPortalSession(user?.id!);

  return session.url;
};
