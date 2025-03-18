'use client';

import { getUserSubscription } from '@/actions/subscription/customer';
import {
  createSubscription,
  createCustomerPortalSession,
} from '@/actions/subscription/session';
import { SubscriptionInterval } from '@/actions/subscription';
import {
  cancelUserSubscription,
  reactivateUserSubscription,
} from '@/actions/subscription/status';
import { Subscription } from '@prisma/client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  const [isRedirectingToPortal, setIsRedirectingToPortal] = useState(false);

  // Fetch subscription data
  const fetchSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getUserSubscription();
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

  // Handle subscription creation
  const handleSubscribe = async (interval: SubscriptionInterval) => {
    setIsSubscribing(true);
    try {
      const response = await createSubscription(interval);

      if (!response.success) {
        toast.error(response.error || 'Failed to create subscription');
        return null;
      }

      if (response.url) {
        window.location.href = response.url;
        return response;
      } else {
        toast.error('No checkout URL returned');
        return null;
      }
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      toast.error(error.message || 'Failed to create subscription');
      return null;
    } finally {
      setIsSubscribing(false);
    }
  };

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
        toast.error(response.error || 'Failed to create portal session');
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

  // Initialize by fetching subscription
  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    subscription,
    isLoading,
    isSubscribing,
    isCanceling,
    isReactivating,
    isRedirectingToPortal,
    fetchSubscription,
    handleSubscribe,
    handleCancelSubscription,
    handleReactivateSubscription,
    handleRedirectToPortal,
  };
}
