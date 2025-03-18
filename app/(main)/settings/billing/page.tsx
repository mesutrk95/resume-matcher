'use client';

import { CurrentSubscription } from '@/components/subscription/current-subscription';
import { SubscriptionPlans } from '@/components/subscription/subscription-plans';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSubscription } from '@/hooks/useSubscription';
import { usePricing } from '@/hooks/usePricing';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useStripeSessionCheck } from '@/hooks/useStripeSessionCheck';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function BillingPage() {
  const {
    subscription,
    isLoading: isLoadingSubscription,
    fetchSubscription,
  } = useSubscription();

  const pricingData = usePricing();

  const { isChecking, checkResult } = useStripeSessionCheck();

  // Get URL parameters
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  // Show toast messages based on URL parameters
  useEffect(() => {
    if (success && !checkResult.checked) {
      toast.success('Your subscription is being processed...');
    }
    if (canceled) {
      toast.info('Subscription checkout was canceled');
    }

    // If the session check completed successfully, refresh subscription data
    if (checkResult.checked && checkResult.success) {
      fetchSubscription();
    }
  }, [success, canceled, checkResult, fetchSubscription]);

  // Loading indicator
  if (isLoadingSubscription || isChecking) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
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
        <TabsList className="grid grid-cols-2 w-[400px] mb-6">
          {subscription && (
            <TabsTrigger id="current-tab" value="current">
              Current Subscription
            </TabsTrigger>
          )}
          <TabsTrigger id="plans-tab" value="plans">
            Subscription Plans
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
            isLoadingPrices={pricingData.isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
