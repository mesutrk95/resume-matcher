'use server';

import { db } from '@/lib/db';
import { getStripeServer } from '@/lib/stripe';
import { SubscriptionStatus } from '@prisma/client';

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

// Create a new checkout session for subscription
export const createCheckoutSession = async (
  userId: string,
  email: string,
  priceId: string,
  name?: string,
) => {
  const stripe = getStripeServer();

  if (!stripe) {
    throw new Error('Failed to initialize Stripe');
  }

  // Get or create customer
  const subscription = await createOrRetrieveCustomer(userId, email, name);

  if (!subscription?.customerId) {
    throw new Error('Could not create or retrieve customer');
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: subscription.customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    subscription_data: {
      trial_period_days: 3, // 3-day trial
      metadata: {
        userId,
      },
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
    metadata: {
      userId,
    },
  });

  return session;
};

// Verify and activate a subscription based on checkout session
export const verifyAndActivateSubscription = async (sessionId: string) => {
  if (!sessionId) {
    return {
      success: false,
      error: 'No session ID provided',
    };
  }

  const stripe = getStripeServer();

  if (!stripe) {
    return {
      success: false,
      error: 'Failed to initialize Stripe',
    };
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });

    // Check if session was successful
    if (session.status !== 'complete') {
      return {
        success: false,
        error: 'Payment not completed',
      };
    }

    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;

    if (!subscriptionId) {
      return {
        success: false,
        error: 'No subscription found in the session',
      };
    }

    // Get the subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Get user from metadata
    const userId = session.metadata?.userId;
    if (!userId) {
      return {
        success: false,
        error: 'User ID not found',
      };
    }

    // Update subscription in database
    await updateSubscriptionInDatabase(
      userId,
      subscription.id,
      subscription.items.data[0].price.id,
      mapStripeStatusToDBStatus(subscription.status),
      new Date(subscription.current_period_start * 1000),
      new Date(subscription.current_period_end * 1000),
      subscription.cancel_at_period_end,
    );

    return {
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status,
    };
  } catch (error: any) {
    console.error('Error verifying subscription:', error);
    return {
      success: false,
      error: error.message || 'Failed to verify subscription',
    };
  }
};

// Cancel a subscription
export const cancelSubscription = async (userId: string) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const subscription = await getSubscriptionByUserId(userId);

  if (!subscription?.subscriptionId) {
    throw new Error('No subscription found');
  }

  const stripe = getStripeServer();

  if (!stripe) {
    throw new Error('Failed to initialize Stripe');
  }

  try {
    // Cancel at period end
    await stripe.subscriptions.update(subscription.subscriptionId, {
      cancel_at_period_end: true,
    });

    // Update database
    return db.subscription.update({
      where: { userId },
      data: {
        cancelAtPeriodEnd: true,
      },
    });
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    throw new Error(`Failed to cancel subscription: ${error.message}`);
  }
};

// Reactivate a subscription that was set to cancel
export const reactivateSubscription = async (userId: string) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const subscription = await getSubscriptionByUserId(userId);

  if (!subscription?.subscriptionId) {
    throw new Error('No subscription found');
  }

  const stripe = getStripeServer();

  if (!stripe) {
    throw new Error('Failed to initialize Stripe');
  }

  try {
    // Cancel the cancellation
    await stripe.subscriptions.update(subscription.subscriptionId, {
      cancel_at_period_end: false,
    });

    // Update database
    return db.subscription.update({
      where: { userId },
      data: {
        cancelAtPeriodEnd: false,
      },
    });
  } catch (error: any) {
    console.error('Error reactivating subscription:', error);
    throw new Error(`Failed to reactivate subscription: ${error.message}`);
  }
};

// Update subscription in database
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

// Create a billing portal session
export const getPortalSession = async (userId: string) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const subscription = await getSubscriptionByUserId(userId);

  if (!subscription?.customerId) {
    throw new Error('No customer found');
  }

  const stripe = getStripeServer();

  if (!stripe) {
    throw new Error('Failed to initialize Stripe');
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
    });

    return session;
  } catch (error: any) {
    console.error('Error creating billing portal session:', error);
    throw new Error(
      `Failed to create billing portal session: ${error.message}`,
    );
  }
};

// Helper to map Stripe subscription status to database status
function mapStripeStatusToDBStatus(stripeStatus: string): SubscriptionStatus {
  switch (stripeStatus) {
    case 'active':
      return SubscriptionStatus.ACTIVE;
    case 'canceled':
      return SubscriptionStatus.CANCELED;
    case 'incomplete':
      return SubscriptionStatus.INCOMPLETE;
    case 'incomplete_expired':
      return SubscriptionStatus.INCOMPLETE_EXPIRED;
    case 'past_due':
      return SubscriptionStatus.PAST_DUE;
    case 'trialing':
      return SubscriptionStatus.TRIALING;
    case 'unpaid':
      return SubscriptionStatus.UNPAID;
    default:
      return SubscriptionStatus.ACTIVE;
  }
}
