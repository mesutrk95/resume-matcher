'use client';

import { useSubscription } from '@/providers/SubscriptionProvider';
import { SubscriptionStatus } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { LottieAnimatedIcon } from '@/app/_components/lottie-animated-icon';

export function SubscriptionStatusIndicator() {
  const { subscription, isLoading } = useSubscription();
  const router = useRouter();

  if (isLoading) {
    return null;
  }

  // No subscription or canceled
  if (
    !subscription ||
    subscription.status === SubscriptionStatus.CANCELED ||
    subscription.cancelAtPeriodEnd
  ) {
    return (
      <Badge
        variant="outline"
        className="cursor-pointer border-dashed py-1"
        onClick={() => router.push('/settings/billing')}
      >
        <LottieAnimatedIcon icon="/iconly/Star5.json"/>
        {/* <Sparkles className="h-3 w-3 mr-1" /> */}
        <span className='ms-2'>Upgrade</span>
      </Badge>
    );
  }

  // User on trial
  if (subscription.status === SubscriptionStatus.TRIALING) {
    // Calculate days remaining
    const trialEndDate = subscription.currentPeriodEnd;
    const daysRemaining = trialEndDate
      ? Math.ceil(
          (new Date(trialEndDate).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

    return (
      <Badge
        variant="outline"
        className="cursor-pointer bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
        onClick={() => router.push('/settings/billing')}
      >
        Trial: {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
      </Badge>
    );
  }

  // Active subscription
  if (subscription.status === SubscriptionStatus.ACTIVE) {
    return (
      <Badge
        variant="outline"
        className="cursor-pointer bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
        onClick={() => router.push('/settings/billing')}
      >
        Pro
      </Badge>
    );
  }

  // Past due subscription
  if (subscription.status === SubscriptionStatus.PAST_DUE) {
    return (
      <Badge
        variant="outline"
        className="cursor-pointer bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
        onClick={() => router.push('/settings/billing')}
      >
        Payment Due
      </Badge>
    );
  }

  return null;
}
