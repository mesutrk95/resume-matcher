'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { useSubscription } from '@/providers/SubscriptionProvider';

interface BillingPageClientProps {
  children: React.ReactNode;
  defaultTab: string;
  showSuccessToast: boolean;
  showCanceledToast: boolean;
}

export function BillingPageClient({
  children,
  defaultTab,
  showSuccessToast,
  showCanceledToast,
}: BillingPageClientProps) {
  // We still need the subscription provider, but only for mutation functions
  const { fetchSubscription } = useSubscription();

  // Handle one-time notifications
  useEffect(() => {
    // Show success toast if needed
    if (showSuccessToast) {
      toast.success('Your subscription is being processed...');
    }

    // Show canceled toast if needed
    if (showCanceledToast) {
      toast.info('Subscription checkout was canceled');
    }

    // Clean URL if needed
    if (showSuccessToast || showCanceledToast) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Refresh subscription data when component mounts
    fetchSubscription();
  }, [showSuccessToast, showCanceledToast, fetchSubscription]);

  return <>{children}</>;
}
