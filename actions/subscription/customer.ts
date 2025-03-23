'use server';

import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getStripeServer } from '@/lib/stripe';
import { SubscriptionStatus } from '@prisma/client';
import { mapStripeStatusToDBStatus } from './constants';
import { updateSubscriptionInDatabase } from './utils';
import Logger from '@/lib/logger';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@/lib/exceptions';

export const getUserSubscription = async () => {
  const user = await currentUser();
  if (!user || !user.id) return null;

  const subscription = await getSubscriptionByUserId(user.id);

  if (subscription?.subscriptionId) {
    const stripe = getStripeServer();
    if (!stripe) {
      throw new InternalServerErrorException('Failed to initialize Stripe');
    }

    const subscriptionId = String(subscription.subscriptionId);

    try {
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscriptionId,
      );

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

        return await getSubscriptionByUserId(user.id);
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
        return await getSubscriptionByUserId(user.id);
      }
      throw error;
    }
  }

  return subscription;
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
export const createCustomer = async (
  userId: string,
  email: string,
  name?: string,
) => {
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
export const createOrRetrieveCustomer = async (
  userId: string,
  email: string,
  name?: string,
) => {
  if (!userId) {
    throw new BadRequestException('User ID is required');
  }

  const subscription = await getSubscriptionByUserId(userId);

  if (subscription?.customerId) {
    return subscription;
  }

  return await createCustomer(userId, email, name);
};
