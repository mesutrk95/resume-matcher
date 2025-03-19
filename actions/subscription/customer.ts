'use server';

import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getStripeServer } from '@/lib/stripe';
import { SubscriptionStatus } from '@prisma/client';
import { mapStripeStatusToDBStatus } from './constants';
import { updateSubscriptionInDatabase } from './utils';
import Logger from '@/lib/logger';
import crypto from 'crypto';

// Get current user subscription
export const getUserSubscription = async () => {
  const requestId = crypto.randomUUID().slice(0, 8);

  try {
    const user = await currentUser();
    if (!user || !user.id) return null;

    // Get local subscription data
    const subscription = await getSubscriptionByUserId(user.id);

    // Validate with Stripe if we have a subscription ID
    if (subscription?.subscriptionId) {
      try {
        const stripe = getStripeServer();
        const subscriptionId = String(subscription.subscriptionId);
        const stripeSubscription = await stripe.subscriptions.retrieve(
          subscriptionId,
        );

        // Update DB if status doesn't match
        if (
          mapStripeStatusToDBStatus(stripeSubscription.status) !==
          subscription.status
        ) {
          Logger.info(
            `Subscription status mismatch - updating in database [${requestId}]`,
          );

          await updateSubscriptionInDatabase(
            user.id,
            subscriptionId,
            subscription.priceId || stripeSubscription.items.data[0].price.id,
            mapStripeStatusToDBStatus(stripeSubscription.status),
            new Date(stripeSubscription.current_period_start * 1000),
            new Date(stripeSubscription.current_period_end * 1000),
            stripeSubscription.cancel_at_period_end,
          );

          return await getSubscriptionByUserId(user.id);
        }
      } catch (error) {
        Logger.error(
          `Error validating subscription with Stripe [${requestId}]`,
          {
            subscriptionId: subscription.subscriptionId,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        );

        // Handle non-existent subscription
        if ((error as any).statusCode === 404) {
          await db.subscription.update({
            where: { userId: user.id },
            data: {
              subscriptionId: null,
              status: SubscriptionStatus.CANCELED,
            },
          });
          return await getSubscriptionByUserId(user.id);
        }
      }
    }

    return subscription;
  } catch (error) {
    Logger.error(`Unexpected error in getUserSubscription [${requestId}]`, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
};

// Get the subscription for a user
export const getSubscriptionByUserId = async (userId: string) => {
  try {
    return await db.subscription.findUnique({ where: { userId } });
  } catch (error) {
    Logger.error(`Error fetching subscription for userId: ${userId}`, {
      error,
    });
    throw error;
  }
};

// Get subscription history for a user
export const getUserSubscriptionHistory = async (userId: string) => {
  try {
    return await db.subscription.findMany({
      where: {
        userId,
        subscriptionId: { not: null },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    Logger.error(`Error fetching subscription history for userId: ${userId}`, {
      error,
    });
    throw error;
  }
};

// Create a new customer in Stripe
export const createCustomer = async (
  userId: string,
  email: string,
  name?: string,
) => {
  const requestId = crypto.randomUUID().slice(0, 8);

  try {
    const stripe = getStripeServer();
    if (!stripe) {
      throw new Error('Failed to initialize Stripe');
    }

    const customer = await stripe.customers.create({
      email,
      name,
      metadata: { userId },
    });
    Logger.info(`Created Stripe customer [${requestId}]`, {
      customerId: customer.id,
    });

    return await db.subscription.upsert({
      where: { userId },
      update: { customerId: customer.id },
      create: {
        userId,
        customerId: customer.id,
        status: SubscriptionStatus.ACTIVE,
      },
    });
  } catch (error) {
    Logger.error(`Error creating customer [${requestId}]`, {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
};

// Create or get existing customer
export const createOrRetrieveCustomer = async (
  userId: string,
  email: string,
  name?: string,
) => {
  try {
    const subscription = await getSubscriptionByUserId(userId);

    if (subscription?.customerId) {
      return subscription;
    }

    return await createCustomer(userId, email, name);
  } catch (error) {
    Logger.error(`Error in createOrRetrieveCustomer`, {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
};
