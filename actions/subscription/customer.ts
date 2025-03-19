'use server';

import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getStripeServer } from '@/lib/stripe';
import { SubscriptionStatus } from '@prisma/client';
import { mapStripeStatusToDBStatus } from './constants';
import { updateSubscriptionInDatabase } from './utils';

// Get current user subscription
export const getUserSubscription = async () => {
  const user = await currentUser();

  if (!user || !user.id) {
    return null;
  }

  // Get local subscription data
  const subscription = await getSubscriptionByUserId(user.id);

  // If we have a subscription with a subscriptionId, validate with Stripe
  if (subscription?.subscriptionId) {
    try {
      const stripe = getStripeServer();

      // Make sure subscriptionId is a string
      const subscriptionId = String(subscription.subscriptionId);

      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscriptionId,
      );

      // If the subscription status doesn't match what we have, update it
      if (
        mapStripeStatusToDBStatus(stripeSubscription.status) !==
        subscription.status
      ) {
        await updateSubscriptionInDatabase(
          user.id,
          subscriptionId,
          subscription.priceId || stripeSubscription.items.data[0].price.id,
          mapStripeStatusToDBStatus(stripeSubscription.status),
          new Date(stripeSubscription.current_period_start * 1000),
          new Date(stripeSubscription.current_period_end * 1000),
          stripeSubscription.cancel_at_period_end,
        );

        // Return the updated record
        return await getSubscriptionByUserId(user.id);
      }
    } catch (error) {
      console.error('Error validating subscription with Stripe:', error);
      // If the subscription doesn't exist in Stripe, remove the subscriptionId
      if ((error as any).statusCode && (error as any).statusCode === 404) {
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
};

// Get the subscription for a user
export const getSubscriptionByUserId = async (userId: string) => {
  return db.subscription.findUnique({
    where: { userId },
  });
};

// Get subscription history for a user
export const getUserSubscriptionHistory = async (userId: string) => {
  return db.subscription.findMany({
    where: {
      userId,
      subscriptionId: { not: null }, // Only retrieve records with a Stripe subscription ID
    },
    orderBy: { createdAt: 'desc' },
  });
};

// Create a new customer in Stripe
export const createCustomer = async (
  userId: string,
  email: string,
  name?: string,
) => {
  const stripe = getStripeServer();

  if (!stripe) {
    throw new Error('Failed to initialize Stripe');
  }

  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
    },
  });

  // Create or update subscription record in database
  const subscription = await db.subscription.upsert({
    where: { userId },
    update: {
      customerId: customer.id,
    },
    create: {
      userId,
      customerId: customer.id,
      status: SubscriptionStatus.ACTIVE,
    },
  });

  return subscription;
};

// Create or get existing customer
export const createOrRetrieveCustomer = async (
  userId: string,
  email: string,
  name?: string,
) => {
  const subscription = await getSubscriptionByUserId(userId);

  if (subscription?.customerId) {
    return subscription;
  }

  return await createCustomer(userId, email, name);
};
