'use server';

import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getStripeServer } from '@/lib/stripe';
import { Subscription, SubscriptionStatus } from '@prisma/client';
import { mapStripeStatusToDBStatus } from './constants';
import { updateSubscriptionInDatabase } from './utils';
import Logger from '@/lib/logger';
import { BadRequestException, InternalServerErrorException } from '@/lib/exceptions';

// Define an augmented type for the return value
type SubscriptionWithPlanDetails = Subscription & {
  planName?: string | null;
  planInterval?: string | null;
  planIntervalCount?: number | null;
};

export const getUserSubscription = async (): Promise<SubscriptionWithPlanDetails | null> => {
  const user = await currentUser();
  if (!user || !user.id) return null;

  const subscription = await getSubscriptionByUserId(user.id);

  // If there's no subscription or no customer ID, return null
  if (!subscription || !subscription.customerId) return null;

  if (!subscription.subscriptionId) {
    // Update the subscription status to INCOMPLETE to make sure it's correct
    await db.subscription.update({
      where: { userId: user.id },
      data: {
        status: SubscriptionStatus.INCOMPLETE,
      },
    });

    // Return the updated subscription
    return await getSubscriptionByUserId(user.id);
  }

  // If there is a subscription ID, check Stripe for the current status
  const stripe = getStripeServer();
  if (!stripe) {
    throw new InternalServerErrorException('Failed to initialize Stripe');
  }

  const subscriptionId = String(subscription.subscriptionId);

  let planName: string | null = null;
  let planInterval: string | null = null;
  let planIntervalCount: number | null = null;

  try {
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['plan.product'],
    });

    const plan = (stripeSubscription as any).plan;
    const product = plan?.product;

    planName = typeof product === 'object' && product !== null ? product.name : null;
    planInterval = plan?.interval ?? null;
    planIntervalCount = plan?.interval_count ?? null;

    // Check if the status in our database matches Stripe
    if (mapStripeStatusToDBStatus(stripeSubscription.status) !== subscription.status) {
      // Update our database to match Stripe's status
      await updateSubscriptionInDatabase(
        user.id,
        subscriptionId,
        subscription.priceId || stripeSubscription.items.data[0].price.id,
        mapStripeStatusToDBStatus(stripeSubscription.status),
        new Date(stripeSubscription.current_period_start * 1000),
        new Date(stripeSubscription.current_period_end * 1000),
        stripeSubscription.cancel_at_period_end,
      );

      const updatedDbSubscription = await getSubscriptionByUserId(user.id);
      return updatedDbSubscription
        ? {
            ...updatedDbSubscription,
            planName,
            planInterval,
            planIntervalCount,
          }
        : null;
    }
  } catch (error: any) {
    Logger.error(`Failed to retrieve subscription ${subscriptionId}`, error);
    if (error.statusCode === 404) {
      await db.subscription.update({
        where: { userId: user.id },
        data: {
          subscriptionId: null,
          status: SubscriptionStatus.CANCELED,
        },
      });
      const updatedDbSubscription = await getSubscriptionByUserId(user.id);
      return updatedDbSubscription
        ? {
            ...updatedDbSubscription,
            planName: null,
            planInterval: null,
            planIntervalCount: null,
          }
        : null;
    }
    // Re-throw other errors
    Logger.error(`Unhandled error retrieving subscription ${subscriptionId}`, error);
    throw new InternalServerErrorException('Failed to retrieve subscription details');
  }

  return { ...subscription, planName, planInterval, planIntervalCount };
};

// Get the subscription for a user
export const getSubscriptionByUserId = async (userId: string) => {
  if (!userId) {
    throw new BadRequestException('User ID is required');
  }

  return await db.subscription.findUnique({ where: { userId } });
};

export const getUserSubscriptionHistory = async (userId: string) => {
  if (!userId) {
    throw new BadRequestException('User ID is required');
  }

  return await db.subscription.findMany({
    where: {
      userId,
      subscriptionId: { not: null },
    },
    orderBy: { createdAt: 'desc' },
  });
};

// Create a new customer in Stripe
export const createCustomer = async (userId: string, email: string, name?: string) => {
  if (!userId) {
    throw new BadRequestException('User ID is required');
  }

  if (!email) {
    throw new BadRequestException('Email is required');
  }

  const stripe = getStripeServer();
  if (!stripe) {
    throw new InternalServerErrorException('Failed to initialize Stripe');
  }

  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { userId },
  });

  Logger.info(`Created Stripe customer for user ${userId}`);

  return await db.subscription.upsert({
    where: { userId },
    update: { customerId: customer.id },
    create: {
      userId,
      customerId: customer.id,
      status: SubscriptionStatus.ACTIVE,
    },
  });
};

// Create or get existing customer
export const createOrRetrieveCustomer = async (userId: string, email: string, name?: string) => {
  if (!userId) {
    throw new BadRequestException('User ID is required');
  }

  const subscription = await getSubscriptionByUserId(userId);

  if (subscription?.customerId) {
    return subscription;
  }

  return await createCustomer(userId, email, name);
};
