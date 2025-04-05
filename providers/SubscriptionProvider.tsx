'use client';

import { getUserSubscription } from '@/actions/subscription/customer';
import { createCustomerPortalSession } from '@/actions/subscription/session';
import {
  cancelUserSubscription,
  reactivateUserSubscription,
} from '@/actions/subscription/status';
import {
  Subscription as PrismaSubscription,
  SubscriptionStatus,
} from '@prisma/client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { toast } from 'sonner';

// Define the augmented type based on what getUserSubscription returns
export type SubscriptionWithPlanDetails = PrismaSubscription & {
  // Add export here
  planName?: string | null;
  planInterval?: string | null;
  planIntervalCount?: number | null;
};

interface SubscriptionContextType {
  subscription: SubscriptionWithPlanDetails | null; // Use augmented type
  isLoading: boolean;
  isSubscribing: boolean;
  isCanceling: boolean;
  isReactivating: boolean;
  isRedirectingToPortal: boolean;
  fetchSubscription: () => Promise<SubscriptionWithPlanDetails | null>; // Use augmented type
  handleCancelSubscription: () => Promise<boolean>;
  handleReactivateSubscription: () => Promise<boolean>;
  handleRedirectToPortal: (returnUrl?: string) => Promise<boolean>;

  isTrialingBannerEnable?: boolean;
  dismissTrialBanner: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null, // Initial value remains null
  isLoading: false,
  isSubscribing: false,
  isCanceling: false,
  isReactivating: false,
  isRedirectingToPortal: false,
  fetchSubscription: async () => null, // Initial function returns null
  handleCancelSubscription: async () => false,
  handleReactivateSubscription: async () => false,
  handleRedirectToPortal: async () => false,
  dismissTrialBanner: () => {},
});

export const SubscriptionProvider = ({
  children,
  initialSubscription = null,
}: {
  children: React.ReactNode;
  initialSubscription?: SubscriptionWithPlanDetails | null; // Use augmented type
}) => {
  const [subscription, setSubscription] =
    useState<SubscriptionWithPlanDetails | null>(initialSubscription); // Use augmented type
  const [isLoading, setIsLoading] = useState(!initialSubscription);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  const [isRedirectingToPortal, setIsRedirectingToPortal] = useState(false);
  const [isTrailBannerDismissed, setIsTrailBannerDismissed] = useState(false);

  const fetchSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getUserSubscription();

      // If we have a subscription with customerId but no subscriptionId, it might be abandoned
      if (data?.customerId && !data?.subscriptionId) {
        const { cleanupAbandonedSubscriptions } = await import(
          '@/actions/subscription/cleanup'
        );
        const cleanedData = await cleanupAbandonedSubscriptions(data.userId);
        setSubscription(cleanedData);
        return cleanedData;
      }

      setSubscription(data);
      return data;
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
      if (error.message !== 'User not authenticated') {
        // Don't show toast for auth errors as those are expected when not logged in
        toast.error(error.message || 'Failed to fetch subscription');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    try {
      const response = await cancelUserSubscription();

      if (response.success) {
        toast.success(response.message || 'Subscription canceled successfully');
        await fetchSubscription();
        return true;
      } else {
        toast.error(response.error?.message || 'Failed to cancel subscription');
        return false;
      }
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      toast.error(error.message || 'Failed to cancel subscription');
      return false;
    } finally {
      setIsCanceling(false);
    }
  };

  // Handle subscription reactivation
  const handleReactivateSubscription = async () => {
    setIsReactivating(true);
    try {
      const response = await reactivateUserSubscription();

      if (response.success) {
        toast.success(
          response.message || 'Subscription reactivated successfully',
        );
        await fetchSubscription();
        return true;
      } else {
        toast.error(
          response.error?.message || 'Failed to reactivate subscription',
        );
        return false;
      }
    } catch (error: any) {
      console.error('Error reactivating subscription:', error);
      toast.error(error.message || 'Failed to reactivate subscription');
      return false;
    } finally {
      setIsReactivating(false);
    }
  };

  // Handle redirection to Stripe's customer portal
  const handleRedirectToPortal = async (returnUrl?: string) => {
    setIsRedirectingToPortal(true);
    try {
      const response = await createCustomerPortalSession(returnUrl);

      if (response.success && response.url) {
        window.location.href = response.url;
        return true;
      } else {
        toast.error('Failed to create portal session');
        return false;
      }
    } catch (error: any) {
      console.error('Error creating portal session:', error);
      toast.error(error.message || 'Failed to create portal session');
      return false;
    } finally {
      setIsRedirectingToPortal(false);
    }
  };

  // Initialize by fetching subscription if not provided initially
  useEffect(() => {
    if (!initialSubscription) {
      fetchSubscription();
    }
  }, [fetchSubscription, initialSubscription]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isLoading,
        isSubscribing,
        isCanceling,
        isReactivating,
        isRedirectingToPortal,
        fetchSubscription,
        handleCancelSubscription,
        handleReactivateSubscription,
        handleRedirectToPortal,

        dismissTrialBanner: () => setIsTrailBannerDismissed(true),
        isTrialingBannerEnable:
          !!subscription &&
          subscription.status === SubscriptionStatus.TRIALING &&
          !isTrailBannerDismissed,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  return useContext(SubscriptionContext);
};
