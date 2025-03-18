import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getStripeServer } from '@/lib/stripe';
import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api-error-handler';

export const POST = withErrorHandling(async (request: Request) => {
  const user = await currentUser();

  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { returnUrl } = body;

  try {
    // Get user's subscription
    const subscription = await db.subscription.findUnique({
      where: { userId: user.id },
    });

    if (!subscription?.customerId) {
      return NextResponse.json(
        { error: 'No customer found for this user' },
        { status: 404 },
      );
    }

    const stripe = getStripeServer();

    if (!stripe) {
      return NextResponse.json(
        { error: 'Failed to initialize Stripe' },
        { status: 500 },
      );
    }

    // Get or create portal configuration
    let configId;
    try {
      configId = await getOrCreatePortalConfiguration(stripe);
    } catch (configError) {
      console.error('Error with portal configuration:', configError);
      return NextResponse.json(
        {
          error: `Failed to set up portal configuration: ${
            (configError as Error).message
          }`,
        },
        { status: 500 },
      );
    }

    // Create portal session with configuration
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.customerId,
      return_url:
        returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
      configuration: configId,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: `Failed to create portal session: ${error.message}` },
      { status: 500 },
    );
  }
});

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
