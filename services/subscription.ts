'use server';

import { db } from '@/lib/db';
import { getStripeServer } from '@/lib/stripe';
import { SubscriptionStatus } from '@prisma/client';

export const getSubscriptionByUserId = async (userId: string) => {
  return db.subscription.findUnique({
    where: { userId },
  });
};

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
      status: SubscriptionStatus.INCOMPLETE,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return subscription;
};

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
