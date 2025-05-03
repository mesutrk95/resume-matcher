'use server';

import { ForbiddenException } from '@/lib/exceptions';
import { currentUser } from '@/lib/auth';
import { getStripeServer } from '@/lib/stripe';
import { createOrRetrieveCustomer, getSubscriptionByUserId } from './customer';
import { PRICE_MAPPING, SubscriptionInterval, TRIAL_PERIOD_DAYS } from './index';
import { updateSubscriptionInDatabase } from './utils';
import { mapStripeStatusToDBStatus } from './constants';
import { db } from '@/lib/db';
import {
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  NotFoundException,
} from '@/lib/exceptions';
import Logger from '@/lib/logger';
import { getActivityDispatcher } from '@/lib/activity-dispatcher/factory';

export const createSubscription = async (
  interval: SubscriptionInterval,
  withCardDetails: boolean = true,
) => {
  const user = await currentUser();
  if (!user?.emailVerified) {
    throw new ForbiddenException('Email not verified.');
  }

  if (!user || !user.id || !user.email) {
    throw new UnauthorizedException('User not authenticated');
  }

  const priceId = PRICE_MAPPING[interval];

  if (!priceId) {
    throw new BadRequestException('Invalid subscription interval');
  }

  const session = await createCheckoutSession(
    user.id,
    user.email,
    priceId,
    withCardDetails,
    user.name || undefined,
  );

  return {
    success: true,
    sessionId: session.id,
    url: session.url!,
  };
};

// Create a new checkout session for subscription
export const createCheckoutSession = async (
  userId: string,
  email: string,
  priceId: string,
  withCardDetails: boolean = true,
  name?: string,
) => {
  const stripe = getStripeServer();
  if (!stripe) {
    throw new InternalServerErrorException('Failed to initialize Stripe');
  }

  const subscription = await createOrRetrieveCustomer(userId, email, name);

  if (!subscription?.customerId) {
    throw new InternalServerErrorException('Could not create or retrieve customer');
  }

  const hasHadPreviousSubscription = await hasUserHadSubscription(userId);

  const sessionConfig: any = {
    customer: subscription.customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
    metadata: {
      userId,
    },
  };

  if (withCardDetails) {
    sessionConfig.payment_method_types = ['card'];
  }

  if (!hasHadPreviousSubscription) {
    sessionConfig.subscription_data = {
      trial_period_days: TRIAL_PERIOD_DAYS,
      metadata: {
        userId,
      },
    };
  } else {
    sessionConfig.subscription_data = {
      metadata: {
        userId,
      },
    };
  }

  try {
    return await stripe.checkout.sessions.create(sessionConfig);
  } catch (error: any) {
    Logger.error('Failed to create checkout session', {
      userId,
      error: error.message,
    });
    throw new InternalServerErrorException('Failed to create checkout session');
  }
};

async function hasUserHadSubscription(userId: string): Promise<boolean> {
  const count = await db.subscription.count({
    where: {
      userId,
      subscriptionId: { not: null }, // Only count subscriptions that have a Stripe subscription ID
    },
  });

  return count > 0;
}

export const getUserSubscriptionHistory = async (userId: string) => {
  if (!userId) {
    throw new BadRequestException('User ID is required');
  }

  return db.subscription.findMany({
    where: {
      userId,
      subscriptionId: { not: null },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const verifySubscriptionFromSession = async (sessionId: string) => {
  if (!sessionId) {
    throw new BadRequestException('No session ID provided');
  }

  const stripe = getStripeServer();
  if (!stripe) {
    throw new InternalServerErrorException('Failed to initialize Stripe');
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });
  } catch (error: any) {
    Logger.error('Error retrieving checkout session', {
      sessionId,
      error: error.message,
    });
    throw new InternalServerErrorException('Failed to retrieve checkout session');
  }

  if (session.status !== 'complete') {
    throw new BadRequestException('Payment not completed');
  }

  let subscriptionId;
  if (typeof session.subscription === 'string') {
    subscriptionId = session.subscription;
  } else if (
    session.subscription &&
    typeof session.subscription === 'object' &&
    'id' in session.subscription
  ) {
    subscriptionId = session.subscription.id;
  } else {
    throw new BadRequestException('Invalid subscription data in session');
  }

  if (!subscriptionId) {
    throw new NotFoundException('No subscription found in the session');
  }

  let subscription;
  try {
    subscription = await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error: any) {
    Logger.error('Error retrieving subscription', {
      subscriptionId,
      error: error.message,
    });
    throw new InternalServerErrorException('Failed to retrieve subscription');
  }

  const userId = session.metadata?.userId;
  if (!userId) {
    throw new BadRequestException('User ID not found');
  }

  await updateSubscriptionInDatabase(
    userId,
    subscription.id,
    subscription.items.data[0].price.id,
    mapStripeStatusToDBStatus(subscription.status),
    new Date(subscription.current_period_start * 1000),
    new Date(subscription.current_period_end * 1000),
    subscription.cancel_at_period_end,
  );

  getActivityDispatcher().dispatchInfo(`Subscription created: ${subscriptionId}`, {
    userId,
    subscriptionId,
    status: subscription.status,
    priceId: subscription.items.data[0].price.id,
  });

  return {
    success: true,
    subscriptionId: subscription.id,
    status: subscription.status,
  };
};

export const createCustomerPortalSession = async (returnUrl?: string) => {
  const user = await currentUser();
  if (!user?.emailVerified) {
    throw new ForbiddenException('Email not verified.');
  }
  if (!user || !user.id) {
    throw new UnauthorizedException('User not authenticated');
  }

  const subscription = await getSubscriptionByUserId(user.id);
  if (!subscription?.customerId) {
    throw new NotFoundException('No customer found for this user');
  }

  const stripe = getStripeServer();
  if (!stripe) {
    throw new InternalServerErrorException('Failed to initialize Stripe');
  }

  let configId;
  try {
    configId = await getOrCreatePortalConfiguration(stripe);
  } catch (error: any) {
    Logger.error('Error with portal configuration', { error: error.message });
    throw new InternalServerErrorException('Failed to set up portal configuration');
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.customerId,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
      configuration: configId,
    });

    return {
      success: true,
      url: session.url,
    };
  } catch (error: any) {
    Logger.error('Error creating billing portal session', {
      error: error.message,
    });
    throw new InternalServerErrorException('Failed to create billing portal session');
  }
};

async function getOrCreatePortalConfiguration(stripe: any) {
  const configVersion = process.env.PORTAL_CONFIG_VERSION || 'v1';
  const configName = 'resume-matcher-portal-config';

  const configsResponse = await stripe.billingPortal.configurations.list({
    limit: 100,
  });

  for (const config of configsResponse.data) {
    if (config.metadata && config.metadata.version === configVersion) {
      return config.id;
    }
  }

  const newConfig = await stripe.billingPortal.configurations.create({
    business_profile: {
      headline: 'Manage your subscription',
      privacy_policy_url:
        process.env.PRIVACY_POLICY_URL || `${process.env.NEXT_PUBLIC_APP_URL}/privacy`,
      terms_of_service_url:
        process.env.TERMS_OF_SERVICE_URL || `${process.env.NEXT_PUBLIC_APP_URL}/terms`,
    },
    features: {
      customer_update: {
        allowed_updates: ['email', 'address', 'phone', 'name', 'tax_id'],
        enabled: true,
      },
      invoice_history: {
        enabled: true,
      },
      payment_method_update: {
        enabled: true,
      },
      subscription_cancel: {
        enabled: true,
        mode: 'at_period_end',
        cancellation_reason: {
          enabled: true,
          options: [
            'too_expensive',
            'missing_features',
            'switched_service',
            'unused',
            'customer_service',
            'too_complex',
            'low_quality',
            'other',
          ],
        },
      },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ['promotion_code', 'price'],
        proration_behavior: 'create_prorations',
        products: [
          {
            product: process.env.STRIPE_BASIC_PRODUCT_ID,
            prices: [
              process.env.STRIPE_BASIC_PRICE_WEEKLY,
              process.env.STRIPE_BASIC_PRICE_MONTHLY,
              process.env.STRIPE_BASIC_PRICE_QUARTERLY,
              process.env.STRIPE_BASIC_PRICE_YEARLY,
              process.env.STRIPE_BASIC_PRICE_BIANNUAL,
            ].filter(Boolean),
          },
        ],
      },
    },
    metadata: {
      version: configVersion,
      name: configName,
    },
  });

  return newConfig.id;
}
