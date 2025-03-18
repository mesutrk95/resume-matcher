'use server';

import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getStripeServer } from '@/lib/stripe';
import { SubscriptionStatus } from '@prisma/client';

// Get current user subscription
export const getUserSubscription = async () => {
  const user = await currentUser();

  if (!user || !user.id) {
    return null;
  }

  const subscription = await getSubscriptionByUserId(user.id);
  return subscription;
};

// Get the subscription for a user
export const getSubscriptionByUserId = async (userId: string) => {
  return db.subscription.findUnique({
    where: { userId },
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
