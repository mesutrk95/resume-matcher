'use server';

import { currentUser } from '@/lib/auth';
import { getStripeServer } from '@/lib/stripe';
import { createOrRetrieveCustomer, getSubscriptionByUserId } from './customer';
import {
  PRICE_MAPPING,
  SubscriptionInterval,
  TRIAL_PERIOD_DAYS,
} from './index';
import { updateSubscriptionInDatabase } from './utils';
import { mapStripeStatusToDBStatus } from './constants';
import { db } from '@/lib/db';

// Create a new subscription
export const createSubscription = async (
  interval: SubscriptionInterval,
  withCardDetails: boolean = true,
) => {
  const user = await currentUser();

  if (!user || !user.id || !user.email) {
    return {
      success: false,
      error: 'User not authenticated',
    };
  }

  const priceId = PRICE_MAPPING[interval];

  if (!priceId) {
    return {
      success: false,
      error: 'Invalid subscription interval',
    };
  }

  try {
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
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return {
      success: false,
      error: error.message || 'Failed to create subscription',
    };
  }
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
    throw new Error('Failed to initialize Stripe');
  }

  // Get or create customer
  const subscription = await createOrRetrieveCustomer(userId, email, name);

  if (!subscription?.customerId) {
    throw new Error('Could not create or retrieve customer');
  }

  // Check if user has had previous subscriptions
  const hasHadPreviousSubscription = await hasUserHadSubscription(userId);

  // Create checkout session configuration
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

  // Only add payment_method_types if card details are required
  if (withCardDetails) {
    sessionConfig.payment_method_types = ['card'];
  }

  // Only add trial period if it's the user's first subscription
  if (!hasHadPreviousSubscription) {
    sessionConfig.subscription_data = {
      trial_period_days: TRIAL_PERIOD_DAYS,
      metadata: {
        userId,
        isFirstSubscription: 'true',
      },
    };
  } else {
    sessionConfig.subscription_data = {
      metadata: {
        userId,
        isFirstSubscription: 'false',
      },
    };
  }

  // Create the session
  const session = await stripe.checkout.sessions.create(sessionConfig);
  return session;
};

// Helper function to check if user has had previous subscriptions
async function hasUserHadSubscription(userId: string): Promise<boolean> {
  const count = await db.subscription.count({
    where: {
      userId,
      subscriptionId: { not: null }, // Only count subscriptions that have a Stripe subscription ID
    },
  });

  return count > 0;
}

// Get user subscription history (implementation in customer.ts)
export const getUserSubscriptionHistory = async (userId: string) => {
  return db.subscription.findMany({
    where: {
      userId,
      subscriptionId: { not: null }, // Only retrieve records with a Stripe subscription ID
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const verifySubscriptionFromSession = async (sessionId: string) => {
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

    // This is the problematic part - session.subscription might be an object instead of a string
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
      return {
        success: false,
        error: 'Invalid subscription data in session',
      };
    }

    if (!subscriptionId) {
      return {
        success: false,
        error: 'No subscription found in the session',
      };
    }

    // Now get the subscription details using the extracted ID
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // The rest of your code...
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

// Create a billing portal session
export const createCustomerPortalSession = async (returnUrl?: string) => {
  const user = await currentUser();

  if (!user || !user.id) {
    throw new Error('User not authenticated');
  }

  const subscription = await getSubscriptionByUserId(user.id);

  if (!subscription?.customerId) {
    throw new Error('No customer found for this user');
  }

  const stripe = getStripeServer();

  if (!stripe) {
    throw new Error('Failed to initialize Stripe');
  }

  try {
    // Get or create portal configuration
    let configId;
    try {
      configId = await getOrCreatePortalConfiguration(stripe);
    } catch (configError) {
      console.error('Error with portal configuration:', configError);
      throw new Error(
        `Failed to set up portal configuration: ${
          (configError as Error).message
        }`,
      );
    }

    // Create portal session with configuration
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.customerId,
      return_url:
        returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
      configuration: configId,
    });

    return {
      success: true,
      url: session.url,
    };
  } catch (error: any) {
    console.error('Error creating billing portal session:', error);
    return {
      success: false,
      error: error.message || 'Failed to create billing portal session',
    };
  }
};

// Helper function to get or create portal configuration
async function getOrCreatePortalConfiguration(stripe: any) {
  const configVersion = process.env.PORTAL_CONFIG_VERSION || 'v1';
  const configName = 'resume-matcher-portal-config';

  try {
    // List all configurations
    const configsResponse = await stripe.billingPortal.configurations.list({
      limit: 100,
    });

    // Check if our configuration already exists
    for (const config of configsResponse.data) {
      if (config.metadata && config.metadata.version === configVersion) {
        console.log('Found existing portal configuration:', config.id);
        return config.id;
      }
    }

    console.log('Creating new portal configuration...');

    // Create new configuration
    const newConfig = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: 'Manage your subscription',
        privacy_policy_url:
          process.env.PRIVACY_POLICY_URL ||
          `${process.env.NEXT_PUBLIC_APP_URL}/privacy`,
        terms_of_service_url:
          process.env.TERMS_OF_SERVICE_URL ||
          `${process.env.NEXT_PUBLIC_APP_URL}/terms`,
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

    console.log('Created new portal configuration:', newConfig.id);
    return newConfig.id;
  } catch (error) {
    console.error('Error managing portal configuration:', error);
    throw error;
  }
}
