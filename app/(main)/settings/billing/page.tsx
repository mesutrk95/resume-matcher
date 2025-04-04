'use client';

import { CurrentSubscription } from '@/components/subscription/current-subscription';
import { SubscriptionPlans } from '@/components/subscription/subscription-plans';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSubscription } from '@/providers/SubscriptionProvider';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { getSubscriptionPrices } from '@/actions/subscription/pricing';
import { verifySubscriptionFromSession } from '@/actions/subscription/session';
import {
  PaymentHistory,
  PaymentHistoryItem,
} from '@/components/subscription/payment-history';
import { getPaymentHistory } from '@/actions/subscription/payments';

export default function BillingPage() {
  const { subscription, fetchSubscription } = useSubscription();
  const [pricingData, setPricingData] = useState<{
    prices: Record<string, number>;
    product: any | null;
    error: string | null;
  }>({
    prices: {},
    product: null,
    error: null,
  });

  // Payment history states
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>(
    [],
  );
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Get URL parameters
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');
  const sessionId = searchParams.get('session_id');

  // Handle session verification and cleanup
  useEffect(() => {
    if (sessionId && success === 'true') {
      verifySubscriptionFromSession(sessionId)
        .then(result => {
          if (result.success) {
            // Clean up URL parameters
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname,
            );
            toast.success('Subscription activated successfully!');
            fetchSubscription();
          } else {
            toast.error('Failed to verify subscription');
          }
        })
        .catch(error => {
          toast.error(error.message || 'An unexpected error occurred');
        });
    } else if (success && !sessionId) {
      toast.success('Your subscription is being processed...');
    } else if (canceled) {
      toast.info('Subscription checkout was canceled');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [sessionId, success, canceled, fetchSubscription]);

  // Load pricing data
  useEffect(() => {
    getSubscriptionPrices()
      .then(result => {
        if (result.success) {
          setPricingData({
            prices: result.prices || {},
            product: result.product || null,
            error: null,
          });
        } else {
          setPricingData({
            prices: {},
            product: null,
            error: 'Failed to load pricing data.',
          });
        }
      })
      .catch(error => {
        setPricingData({
          prices: {},
          product: null,
          error: error.message || 'An unexpected error occurred.',
        });
      });
  }, []);

  // Load payment history
  useEffect(() => {
    getPaymentHistory()
      .then(({ payments, error }) => {
        setPaymentHistory(payments);
        if (error) {
          setPaymentError(error);
        }
      })
      .catch(err => {
        setPaymentError('Failed to load payment history');
        console.error(err);
      });
  }, [subscription?.subscriptionId]);

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

      <Tabs defaultValue={subscription ? 'current' : 'plans'} className="mt-8">
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
          />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentHistory payments={paymentHistory} error={paymentError} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
