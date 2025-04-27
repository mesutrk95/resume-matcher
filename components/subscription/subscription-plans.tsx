'use client';

import { toast } from 'sonner';
import { SubscriptionInterval } from '@/actions/subscription';
import { Button } from '@/components/ui/button';
import { Subscription, SubscriptionStatus } from '@prisma/client';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Check, CheckCircle, CreditCard, Car, Shield, Star, Zap } from 'lucide-react';
import { Badge } from '../ui/badge';

// Features offered by the subscription
interface Feature {
  name: string;
  description: string;
  icon: React.ReactNode;
  included: boolean;
}

// Default prices in case API fails
const DEFAULT_PRICES = {
  weekly: 4.99,
  monthly: 12.99,
  quarterly: 29.99,
  biannual: 49.99,
  yearly: 89.99,
};

// Feature list with icons and descriptions
const FEATURES: Feature[] = [
  {
    name: 'Unlimited jobs',
    description: 'Track and manage as many job applications as you need',
    icon: <Car className="h-4 w-4 text-blue-500" />,
    included: true,
  },
  {
    name: 'Advanced ATS optimization',
    description: 'Ensure your resume passes through Applicant Tracking Systems',
    icon: <CheckCircle className="h-4 w-4 text-green-500" />,
    included: true,
  },
  {
    name: 'Premium resume templates',
    description: 'Access to all professional templates designed by experts',
    icon: <Star className="h-4 w-4 text-yellow-500" />,
    included: true,
  },
  {
    name: 'Job application tracking',
    description: 'Track status and progress of all your applications',
    icon: <CreditCard className="h-4 w-4 text-purple-500" />,
    included: true,
  },
  {
    name: 'Priority email support',
    description: 'Get faster responses from our dedicated support team',
    icon: <Zap className="h-4 w-4 text-amber-500" />,
    included: true,
  },
  {
    name: 'Resume revision history',
    description: 'Track changes and restore previous versions of your resume',
    icon: <Shield className="h-4 w-4 text-red-500" />,
    included: true,
  },
];

interface SubscriptionPlansProps {
  currentSubscription: Subscription | null;
  pricingData: Record<string, number>;
  productInfo: any | null;
  isTrialEligible: boolean;
}

export function SubscriptionPlans({
  currentSubscription,
  pricingData,
  productInfo,
  isTrialEligible,
}: SubscriptionPlansProps) {
  const PRICES = pricingData || DEFAULT_PRICES;

  const [interval, setInterval] = useState<SubscriptionInterval>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (interval: SubscriptionInterval) => {
    setIsLoading(true);
    try {
      const { createSubscription } = await import('@/actions/subscription/session');
      const response = await createSubscription(interval);

      if (response.success && response.url) {
        window.location.href = response.url;
      } else {
        toast.error('Failed to create subscription');
      }
    } catch (error) {
      toast.error('An error occurred while setting up your subscription');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDiscount = (selectedInterval: SubscriptionInterval) => {
    if (selectedInterval === 'weekly') return 0;

    const weeklyPrice = PRICES.weekly;
    const selectedPrice = PRICES[selectedInterval];

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

  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const hasActiveSubscription =
    currentSubscription &&
    currentSubscription.subscriptionId &&
    (currentSubscription.status === SubscriptionStatus.ACTIVE ||
      currentSubscription.status === SubscriptionStatus.TRIALING);

  const intervals = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: '3 Months' },
    { value: 'biannual', label: '6 Months' },
    { value: 'yearly', label: 'Yearly' },
  ] as const;

  return (
    <div className="w-full">
      {isTrialEligible && (
        <div className="mb-6 p-3 bg-green-100 border border-green-300 rounded-md text-center">
          <p className="font-bold text-green-800">You&apos;re eligible for a FREE 3-day trial!</p>
          <p className="text-sm text-green-700">No charge until your trial ends. Cancel anytime.</p>
        </div>
      )}
      <div className="mx-auto mb-10 max-w-md text-center">
        <h2 className="text-3xl font-bold">{productInfo?.name || 'Minova Pro'}</h2>
        <p className="text-muted-foreground mt-2">
          {productInfo?.description || 'Boost your job search success with our premium tools'}
        </p>
      </div>

      {/* Interval selector tabs */}
      <div className="mb-8 flex justify-center">
        <Tabs
          defaultValue={interval}
          onValueChange={v => setInterval(v as SubscriptionInterval)}
          className="w-full max-w-md"
        >
          <TabsList className="grid grid-cols-5 w-full">
            {intervals.map(i => (
              <TabsTrigger key={i.value} value={i.value} className="text-xs sm:text-sm">
                {i.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Subscription card */}
      <div className="max-w-md mx-auto">
        <Card className="border-2 border-primary shadow-lg">
          <CardHeader className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardTitle className="flex items-center justify-between">
              <span>{productInfo?.name || 'Minova Pro'}</span>
              {calculateDiscount(interval) > 0 && (
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                  Save {calculateDiscount(interval)}%
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {productInfo?.description || 'Full access to all premium features'}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="mb-6 flex items-end">
              <>
                <span className="text-4xl font-bold">{formatPrice(PRICES[interval])}</span>
                <span className="text-muted-foreground ml-2 mb-1">
                  /{interval.replace('ly', '')}
                </span>
              </>
              {isTrialEligible && (
                <div className="ml-auto border border-green-200 bg-green-50 rounded px-2 py-1">
                  <span className="text-xs text-green-700">3-day free trial</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {FEATURES.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <div className="mr-3 mt-0.5">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">{feature.name}</p>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>

          <CardFooter className="bg-gray-50 dark:bg-gray-900 pt-4 pb-5">
            {hasActiveSubscription ? (
              <Button variant="outline" className="w-full" disabled>
                {currentSubscription?.status === SubscriptionStatus.TRIALING
                  ? 'Currently on Trial'
                  : 'Already Subscribed'}
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() => handleSubscribe(interval)}
                disabled={isLoading}
              >
                {isLoading
                  ? 'Processing...'
                  : isTrialEligible
                    ? 'Start Free Trial'
                    : 'Subscribe Now'}
              </Button>
            )}
            <p className="w-full text-center text-xs text-muted-foreground mt-2">
              {isTrialEligible
                ? 'Cancel anytime during your trial. No commitment required.'
                : 'Cancel anytime. No commitment required.'}
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Testimonials or additional info could go here */}
      <div className="mt-12 max-w-3xl mx-auto text-center">
        <p className="text-sm text-muted-foreground">
          By subscribing, you agree to our{' '}
          <a href="#" className="underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="underline">
            Privacy Policy
          </a>
          . We use Stripe for secure payment processing.
        </p>
      </div>
    </div>
  );
}
