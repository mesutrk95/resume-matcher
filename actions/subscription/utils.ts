'use server';

import { db } from '@/lib/db';
import { SubscriptionStatus } from '@prisma/client';

export const updateSubscriptionInDatabase = async (
  userId: string,
  subscriptionId: string,
  priceId: string,
  status: SubscriptionStatus,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd?: boolean,
) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    return db.subscription.upsert({
      where: { userId },
      update: {
        subscriptionId,
        priceId,
        status,
        currentPeriodStart,
        currentPeriodEnd,
        ...(cancelAtPeriodEnd !== undefined && { cancelAtPeriodEnd }),
        updatedAt: new Date(),
      },
      create: {
        userId,
        subscriptionId,
        priceId,
        status,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: cancelAtPeriodEnd || false,
      },
    });
  } catch (error) {
    console.error(`Error updating subscription in database:`, error);
    throw new Error('Failed to update subscription in database');
  }
};

export const getCustomerById = async (customerId: string) => {
  try {
    const stripe = (await import('@/lib/stripe')).getStripeServer();
    if (!stripe) throw new Error('Stripe not initialized');

    return await stripe.customers.retrieve(customerId);
  } catch (error) {
    console.error('Error retrieving customer:', error);
    throw error;
  }
};
