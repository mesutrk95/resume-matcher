'use client';

import { useSubscription } from '@/providers/SubscriptionProvider';
import { SubscriptionStatus } from '@prisma/client';
import { AlertCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '../ui/button';
import { formatDistanceToNow } from 'date-fns';

export function TrialBanner() {
  const { subscription } = useSubscription();
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  // Don't show if no subscription, not on trial, or already dismissed
  if (
    !subscription ||
    subscription.status !== SubscriptionStatus.TRIALING ||
    dismissed
  ) {
    return null;
  }

  // Calculate days remaining
  const trialEndDate = subscription.currentPeriodEnd;
  const timeRemaining = trialEndDate
    ? formatDistanceToNow(new Date(trialEndDate), { addSuffix: true })
    : '';

  return (
    <div className="bg-indigo-600 text-white py-2 px-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm font-medium">
            You&apos;re currently on a trial. Your trial ends {timeRemaining}.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-white text-indigo-600 border-white hover:bg-indigo-100 hover:text-indigo-800"
            onClick={() => router.push('/settings/billing')}
          >
            Manage Subscription
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-indigo-700 hover:text-white p-0 h-6 w-6"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
