'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

interface BillingPageClientProps {
  children: React.ReactNode;
  showSuccessToast: boolean;
  showCanceledToast: boolean;
}

export function BillingPageClient({
  children,
  showSuccessToast,
  showCanceledToast,
}: BillingPageClientProps) {
  useEffect(() => {
    if (showSuccessToast) {
      toast.success('Your subscription is being processed...');
    }

    if (showCanceledToast) {
      toast.info('Subscription checkout was canceled');
    }

    if (showSuccessToast || showCanceledToast) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [showSuccessToast, showCanceledToast]);

  return <>{children}</>;
}
