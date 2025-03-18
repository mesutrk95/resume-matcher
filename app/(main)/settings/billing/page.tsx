// app/(main)/settings/billing/page.tsx
'use client';

import { CurrentSubscription } from '@/components/subscription/current-subscription';
import { SubscriptionPlans } from '@/components/subscription/subscription-plans';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSubscription } from '@/hooks/useSubscription';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useStripeSessionCheck } from '@/hooks/useStripeSessionCheck';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Define types for Stripe price and product data
interface StripePrice {
  id: string;
  unit_amount: number;
  currency: string;
  recurring: {
    interval: string;
    interval_count: number;
  };
  product: string;
  active: boolean;
}

interface StripeProduct {
  id: string;
  name: string;
  description: string;
  active: boolean;
  metadata: Record<string, string>;
}

interface PricingData {
  prices: Record<string, number>;
  product: StripeProduct | null;
  isLoading: boolean;
  error: string | null;
}

export default function BillingPage() {
  // Get subscription data using custom hook
  const {
    subscription,
    isLoading: isLoadingSubscription,
    fetchSubscription,
  } = useSubscription();

  // Check for Stripe session in URL
  const { isChecking, checkResult } = useStripeSessionCheck();

  // State for pricing data
  const [pricingData, setPricingData] = useState<PricingData>({
    prices: {
      weekly: 4.99,
      monthly: 12.99,
      quarterly: 29.99,
      biannual: 49.99,
      yearly: 89.99,
    },
    product: null,
    isLoading: true,
    error: null,
  });

  // Get URL parameters
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  // Fetch pricing data from Stripe
  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        // Make API call to fetch pricing data
        const response = await axios.get('/api/subscription/prices');

        if (response.data && response.data.prices && response.data.product) {
          // Map prices from API to our format
          const prices: Record<string, number> = {};

          response.data.prices.forEach((price: StripePrice) => {
            // Map Stripe's interval to our interval keys
            let intervalKey = price.recurring.interval;

            // Handle special cases based on interval count
            if (price.recurring.interval === 'month') {
              if (price.recurring.interval_count === 1) intervalKey = 'monthly';
              if (price.recurring.interval_count === 3)
                intervalKey = 'quarterly';
              if (price.recurring.interval_count === 6)
                intervalKey = 'biannual';
            } else if (price.recurring.interval === 'week') {
              intervalKey = 'weekly';
            } else if (price.recurring.interval === 'year') {
              intervalKey = 'yearly';
            }

            // Convert cents to dollars
            prices[intervalKey] = price.unit_amount / 100;
          });

          setPricingData({
            prices,
            product: response.data.product,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Error fetching pricing data:', error);
        setPricingData(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load pricing data. Using default values.',
        }));
      }
    };

    fetchPricingData();
  }, []);

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
