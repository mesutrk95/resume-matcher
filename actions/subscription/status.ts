'use server';

import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getStripeServer } from '@/lib/stripe';
import { response } from '@/lib/utils';
import { getSubscriptionByUserId } from './customer';
import {
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  NotFoundException,
} from '@/lib/exceptions';
import Logger from '@/lib/logger';

export const cancelUserSubscription = async () => {
  try {
    const user = await currentUser();
    if (!user || !user.id) {
      throw new UnauthorizedException('Unauthorized');
    }

    await cancelSubscription(user.id);

    return response({
      success: true,
      code: 200,
      message: 'Subscription scheduled for cancellation at the end of the billing period',
    });
  } catch (error: any) {
    if (error instanceof UnauthorizedException) {
      return response({
        success: false,
        error: {
          code: 401,
          message: error.message,
        },
      });
    }

    return response({
      success: false,
      error: {
        code: 500,
        message: error.message || 'Failed to cancel subscription',
      },
    });
  }
};

export const cancelSubscription = async (userId: string) => {
  if (!userId) {
    throw new BadRequestException('User ID is required');
  }

  const subscription = await getSubscriptionByUserId(userId);
  if (!subscription?.subscriptionId) {
    throw new NotFoundException('No subscription found');
  }

  const stripe = getStripeServer();
  if (!stripe) {
    throw new InternalServerErrorException('Failed to initialize Stripe');
  }

  try {
    await stripe.subscriptions.update(subscription.subscriptionId, {
      cancel_at_period_end: true,
    });

    return db.subscription.update({
      where: { userId },
      data: {
        cancelAtPeriodEnd: true,
      },
    });
  } catch (error: any) {
    Logger.error('Error canceling subscription', {
      userId,
      subscriptionId: subscription.subscriptionId,
      error: error.message,
    });
    throw new InternalServerErrorException(`Failed to cancel subscription: ${error.message}`);
  }
};

export const reactivateUserSubscription = async () => {
  try {
    const user = await currentUser();
    if (!user || !user.id) {
      throw new UnauthorizedException('Unauthorized');
    }

    await reactivateSubscription(user.id);

    return response({
      success: true,
      code: 200,
      message: 'Subscription reactivated successfully',
    });
  } catch (error: any) {
    if (error instanceof UnauthorizedException) {
      return response({
        success: false,
        error: {
          code: 401,
          message: error.message,
        },
      });
    }

    return response({
      success: false,
      error: {
        code: 500,
        message: error.message || 'Failed to reactivate subscription',
      },
    });
  }
};

export const reactivateSubscription = async (userId: string) => {
  if (!userId) {
    throw new BadRequestException('User ID is required');
  }

  const subscription = await getSubscriptionByUserId(userId);
  if (!subscription?.subscriptionId) {
    throw new NotFoundException('No subscription found');
  }

  const stripe = getStripeServer();
  if (!stripe) {
    throw new InternalServerErrorException('Failed to initialize Stripe');
  }

  try {
    await stripe.subscriptions.update(subscription.subscriptionId, {
      cancel_at_period_end: false,
    });

    return db.subscription.update({
      where: { userId },
      data: {
        cancelAtPeriodEnd: false,
      },
    });
  } catch (error: any) {
    Logger.error('Error reactivating subscription', {
      userId,
      subscriptionId: subscription.subscriptionId,
      error: error.message,
    });
    throw new InternalServerErrorException(`Failed to reactivate subscription: ${error.message}`);
  }
};
