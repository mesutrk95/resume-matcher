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

  // Check if subscription exists, has a subscriptionId, and has proper status
  const hasActiveSubscription =
    subscription &&
    subscription.subscriptionId &&
    (subscription.status === SubscriptionStatus.ACTIVE ||
      subscription.status === SubscriptionStatus.TRIALING);

  // No subscription, canceled, no subscriptionId, or pending
  if (!hasActiveSubscription) {
    return (
      <Badge
        variant="outline"
        className="cursor-pointer border-slate-300 border-dashed py-1"
        onClick={() => router.push('/settings/billing')}
      >
        <LottieAnimatedIcon icon="/iconly/Star5.json"/>
        {/* <Sparkles className="h-3 w-3 mr-1" /> */}
        <span className='ms-2'>Upgrade</span>
      </Badge>
    );
  }

  // User on trial with valid subscriptionId
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
        className="cursor-pointer bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
        onClick={() => router.push('/settings/billing')}
      >
        Trial: {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
      </Badge>
    );
  }

  // Active subscription with valid subscriptionId
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
