import { db } from '@/lib/db';
import { getStripeServer } from '@/lib/stripe';
import { SubscriptionStatus } from '@prisma/client';

export const getSubscriptionByUserId = (userId: string) => {
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

export const createCheckoutSession = async (
  userId: string,
  email: string,
  priceId: string,
  name?: string,
) => {
  const stripe = getStripeServer();

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
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
    metadata: {
      userId,
    },
  });

  return session;
};

export const cancelSubscription = async (userId: string) => {
  const subscription = await getSubscriptionByUserId(userId);

  if (!subscription?.subscriptionId) {
    throw new Error('No subscription found');
  }

  const stripe = getStripeServer();

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
};

export const reactivateSubscription = async (userId: string) => {
  const subscription = await getSubscriptionByUserId(userId);

  if (!subscription?.subscriptionId) {
    throw new Error('No subscription found');
  }

  const stripe = getStripeServer();

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
};

export const updateSubscriptionInDatabase = async (
  userId: string,
  subscriptionId: string,
  priceId: string,
  status: SubscriptionStatus,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
) => {
  return db.subscription.update({
    where: { userId },
    data: {
      subscriptionId,
      priceId,
      status,
      currentPeriodStart,
      currentPeriodEnd,
    },
  });
};

export const getPortalSession = async (userId: string) => {
  const subscription = await getSubscriptionByUserId(userId);

  if (!subscription?.customerId) {
    throw new Error('No customer found');
  }

  const stripe = getStripeServer();

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  });

  return session;
};
