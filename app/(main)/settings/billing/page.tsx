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
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">
            Loading subscription information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      {pricingData.error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6">
          <p>{pricingData.error}</p>
        </div>
      )}

      <Tabs
        defaultValue={
          subscription && subscription.subscriptionId ? 'current' : 'plans'
        }
      >
        <TabsList className="mb-6">
          {subscription && subscription.subscriptionId && (
            <TabsTrigger value="current">Current Subscription</TabsTrigger>
          )}
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
        </TabsList>

        {subscription && subscription.subscriptionId && (
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
