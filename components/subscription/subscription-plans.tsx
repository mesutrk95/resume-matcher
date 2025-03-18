'use client';

import { Button } from '@/components/ui/button';
import { createSubscription } from '@/actions/subscription';
import { useState } from 'react';
import { Subscription, SubscriptionStatus } from '@prisma/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { LoadingButton } from '../ui/loading-button';
import { Check } from 'lucide-react';

type SubscriptionInterval =
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'biannual'
  | 'yearly';

interface SubscriptionPlansProps {
  currentSubscription: Subscription | null;
}

interface PriceInfo {
  weekly: number;
  monthly: number;
  quarterly: number;
  biannual: number;
  yearly: number;
}

const PRICES: PriceInfo = {
  weekly: 4.99,
  monthly: 12.99,
  quarterly: 29.99,
  biannual: 49.99,
  yearly: 89.99,
};

const FEATURES = [
  'Unlimited jobs',
  'Advanced ATS optimization',
  'All resume templates',
  'Job application tracking',
  'Email support',
  'Resume revision history',
  'Custom resume templates',
];

export function SubscriptionPlans({
  currentSubscription,
}: SubscriptionPlansProps) {
  const [interval, setInterval] = useState<SubscriptionInterval>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);

    try {
      const response = await createSubscription(interval);
      window.location.href = response.url;
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare intervals for the tabs
  const intervals = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: '3 Months' },
    { value: 'biannual', label: '6 Months' },
    { value: 'yearly', label: 'Yearly' },
  ] as const;

  // Format discount percentage
  const calculateDiscount = (selectedInterval: SubscriptionInterval) => {
    if (selectedInterval === 'weekly') return 0;

    const weeklyPrice = PRICES.weekly;
    const selectedPrice = PRICES[selectedInterval];

    // Calculate equivalent weekly cost
    let weeklyEquivalent: number;

    switch (selectedInterval) {
      case 'monthly':
        weeklyEquivalent = selectedPrice / 4;
        break;
      case 'quarterly':
        weeklyEquivalent = selectedPrice / 12;
        break;
      case 'biannual':
        weeklyEquivalent = selectedPrice / 26;
        break;
      case 'yearly':
        weeklyEquivalent = selectedPrice / 52;
        break;
      default:
        return 0;
    }

    // Calculate discount percentage
    const discount = ((weeklyPrice - weeklyEquivalent) / weeklyPrice) * 100;
    return Math.round(discount);
  };

  // Check if user already has an active subscription
  const hasActiveSubscription =
    currentSubscription &&
    (currentSubscription.status === SubscriptionStatus.ACTIVE ||
      currentSubscription.status === SubscriptionStatus.TRIALING);

  return (
    <div className="w-full">
      <div className="mx-auto mb-8 max-w-md text-center">
        <h2 className="text-2xl font-bold">Resume Matcher Pro</h2>
        <p className="text-muted-foreground">
          Unlock all features with our premium subscription
        </p>
      </div>

      <div className="mb-8 flex justify-center">
        <Tabs
          defaultValue={interval}
          onValueChange={v => setInterval(v as SubscriptionInterval)}
        >
          <TabsList className="grid grid-cols-5 w-fit">
            {intervals.map(i => (
              <TabsTrigger
                key={i.value}
                value={i.value}
                className="text-xs sm:text-sm"
              >
                {i.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="max-w-md mx-auto">
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>Resume Matcher Pro</CardTitle>
            <CardDescription>
              Full access to all premium features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <span className="text-3xl font-bold">
                ${PRICES[interval].toFixed(2)}
              </span>
              <span className="text-muted-foreground">/{interval}</span>
              {calculateDiscount(interval) > 0 && (
                <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                  Save {calculateDiscount(interval)}%
                </span>
              )}
              <div className="mt-1 text-sm text-muted-foreground">
                Includes 3-day free trial
              </div>
            </div>
            <ul className="space-y-2">
              {FEATURES.map(feature => (
                <li key={feature} className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            {hasActiveSubscription ? (
              <Button variant="outline" className="w-full" disabled>
                {currentSubscription.status === SubscriptionStatus.TRIALING
                  ? 'Currently on Trial'
                  : 'Already Subscribed'}
              </Button>
            ) : (
              <LoadingButton
                className="w-full"
                onClick={handleSubscribe}
                loading={isLoading}
                disabled={isLoading}
              >
                Subscribe Now
              </LoadingButton>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
