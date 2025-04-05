import { CurrentSubscription } from '@/components/subscription/current-subscription';
import { SubscriptionPlans } from '@/components/subscription/subscription-plans';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { getSubscriptionPrices } from '@/actions/subscription/pricing';
import { getUserSubscription } from '@/actions/subscription/customer';
import { getPaymentHistory } from '@/actions/subscription/payments';
import { PaymentHistory } from '@/components/subscription/payment-history';
import { redirect } from 'next/navigation';
import { verifySubscriptionFromSession } from '@/actions/subscription/session';
import { checkTrialEligibility } from '@/actions/subscription/utils';
import { Metadata } from 'next';
import { BillingPageClient } from '@/components/subscription/billing-client';

export const metadata: Metadata = {
  title: 'Subscription Management',
  description:
    'Manage your subscription, payment methods, and billing information',
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: {
    success?: string;
    canceled?: string;
    session_id?: string;
  };
}) {
  const { success, canceled, session_id: sessionId } = searchParams;

  if (sessionId && success === 'true') {
    try {
      const result = await verifySubscriptionFromSession(sessionId);
      if (result.success) {
        redirect('/settings/billing');
      }
    } catch (error) {
      console.error('Subscription verification failed:', error);
    }
  }

  // Fetch all data in parallel
  const [
    subscriptionResponse,
    pricingResponse,
    paymentHistoryResponse,
    isTrialEligible,
  ] = await Promise.all([
    getUserSubscription().catch(() => null),
    getSubscriptionPrices().catch(() => ({
      success: false,
      prices: {},
      product: null,
    })),
    getPaymentHistory().catch(() => ({
      payments: [],
      error: 'Failed to load payment history',
    })),
    checkTrialEligibility().catch(() => false),
  ]);

  // Prepare data for client components
  const subscription = subscriptionResponse;
  const pricingData = {
    prices: pricingResponse.success ? pricingResponse.prices : {},
    product: pricingResponse.success ? pricingResponse.product : null,
    error: pricingResponse.success ? null : 'Failed to load pricing data.',
  };
  const payments = paymentHistoryResponse.payments;
  const paymentError = paymentHistoryResponse.error;

  // Pre-select tab based on subscription status
  const defaultTab = subscription ? 'current' : 'plans';

  // Determine if we need to show a toast (for client component)
  const showSuccessToast = success === 'true' && !sessionId;
  const showCanceledToast = canceled === 'true';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Subscription Management
        </h1>
        <p className="text-muted-foreground">
          Manage your subscription, payment methods, and billing information
        </p>
      </div>

      {pricingData.error && (
        <Alert variant="default" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>{pricingData.error}</AlertDescription>
        </Alert>
      )}

      {/* Client wrapper for handling toasts and tab state */}
      <BillingPageClient
        defaultTab={defaultTab}
        showSuccessToast={showSuccessToast}
        showCanceledToast={showCanceledToast}
      >
        <Tabs defaultValue={defaultTab} className="mt-8">
          <TabsList className="mb-6 border-b w-full" variant={'bottomline'}>
            {subscription && (
              <TabsTrigger
                id="current-tab"
                value="current"
                variant={'bottomline'}
              >
                Current Subscription
              </TabsTrigger>
            )}
            <TabsTrigger id="plans-tab" value="plans" variant={'bottomline'}>
              Subscription Plans
            </TabsTrigger>
            <TabsTrigger
              id="payments-tab"
              value="payments"
              variant={'bottomline'}
            >
              Payment History
            </TabsTrigger>
          </TabsList>

          {subscription && (
            <TabsContent value="current" className="space-y-6">
              <CurrentSubscription subscription={subscription} />
            </TabsContent>
          )}

          <TabsContent value="plans">
            <SubscriptionPlans
              currentSubscription={subscription}
              pricingData={pricingData.prices}
              productInfo={pricingData.product}
              isTrialEligible={isTrialEligible}
            />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentHistory payments={payments} error={paymentError} />
          </TabsContent>
        </Tabs>
      </BillingPageClient>
    </div>
  );
}
