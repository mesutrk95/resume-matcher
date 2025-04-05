'use client';

import { useSubscription } from '@/providers/SubscriptionProvider';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '../ui/button';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export function TrialBanner() {
  const { subscription, isTrialingBannerEnable, dismissTrialBanner } =
    useSubscription();

  // Don't show if no subscription, not on trial, or already dismissed
  if (!isTrialingBannerEnable) {
    return null;
  }

  // Calculate days remaining
  const trialEndDate = subscription!.currentPeriodEnd;
  const timeRemaining = trialEndDate
    ? formatDistanceToNow(new Date(trialEndDate), { addSuffix: true })
    : '';

  return (
    <div className="bg-indigo-600 text-white py-2 px-4" id="trialing-banner">
      <div className="container mx-auto flex flex-col items-center justify-center gap-y-2 py-2 sm:flex-row sm:justify-between sm:py-0">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm font-medium">Trial ends {timeRemaining}.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-white text-indigo-600 border-white hover:bg-indigo-100 hover:text-indigo-800"
            asChild
          >
            <Link href="/settings/billing">Manage Subscription</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-indigo-700 hover:text-white p-0 h-6 w-6"
            onClick={dismissTrialBanner}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
