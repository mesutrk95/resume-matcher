'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Subscription, SubscriptionStatus } from '@prisma/client';
import {
  cancelUserSubscription,
  reactivateUserSubscription,
  createCustomerPortalSession,
} from '@/actions/subscription';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';
import { CreditCard, ExternalLink, AlertTriangle } from 'lucide-react';
import { LoadingButton } from '../ui/loading-button';

interface CurrentSubscriptionProps {
  subscription: Subscription;
}

// These are the actual variants supported by your Badge component
type BadgeVariant = 'default' | 'destructive' | 'outline' | 'secondary';

export function CurrentSubscription({
  subscription,
}: CurrentSubscriptionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMMM d, yyyy');
  };

  const handleManageBilling = async () => {
    setIsLoading(true);
    try {
      const url = await createCustomerPortalSession();
      window.location.href = url;
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    try {
      const response = await cancelUserSubscription();
      if (response.success) {
        toast.success(response.message);
        window.location.reload();
      } else {
        toast.error(response.error?.message || 'Failed to cancel subscription');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsCanceling(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setIsReactivating(true);
    try {
      const response = await reactivateUserSubscription();
      if (response.success) {
        toast.success(response.message);
        window.location.reload();
      } else {
        toast.error(
          response.error?.message || 'Failed to reactivate subscription',
        );
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsReactivating(false);
    }
  };

  // Helper to get status display
  const getStatusDisplay = () => {
    if (subscription.cancelAtPeriodEnd) {
      return {
        label: 'Canceling',
        description: `Your subscription will end on ${formatDate(
          subscription.currentPeriodEnd,
        )}`,
        variant: 'secondary' as BadgeVariant, // Changed from warning
      };
    }

    switch (subscription.status) {
      case SubscriptionStatus.ACTIVE:
        return {
          label: 'Active',
          description: `Renews on ${formatDate(subscription.currentPeriodEnd)}`,
          variant: 'default' as BadgeVariant, // Changed from success
        };
      case SubscriptionStatus.TRIALING:
        return {
          label: 'Trial',
          description: `Trial ends on ${formatDate(
            subscription.currentPeriodEnd,
          )}`,
          variant: 'outline' as BadgeVariant,
        };
      case SubscriptionStatus.CANCELED:
        return {
          label: 'Canceled',
          description: `Access until ${formatDate(
            subscription.currentPeriodEnd,
          )}`,
          variant: 'destructive' as BadgeVariant,
        };
      case SubscriptionStatus.PAST_DUE:
        return {
          label: 'Past Due',
          description: 'Payment failed, please update your billing information',
          variant: 'destructive' as BadgeVariant,
        };
      default:
        return {
          label: subscription.status,
          description: '',
          variant: 'secondary' as BadgeVariant,
        };
    }
  };

  const statusInfo = getStatusDisplay();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Subscription</CardTitle>
            <CardDescription>Manage your subscription settings</CardDescription>
          </div>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium">Status</h3>
          <p className="text-sm text-muted-foreground">
            {statusInfo.description}
          </p>
        </div>

        {subscription.status === SubscriptionStatus.PAST_DUE && (
          <div className="flex items-start p-3 bg-amber-50 border border-amber-200 rounded-md">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-amber-800">
                Payment Failed
              </h4>
              <p className="text-xs text-amber-700">
                Your last payment attempt failed. Please update your payment
                method to continue your subscription.
              </p>
            </div>
          </div>
        )}

        <div className="rounded-md border p-4">
          <div className="flex items-center gap-4">
            <CreditCard className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Billing Management</p>
              <p className="text-xs text-muted-foreground">
                Update payment methods, view invoices, and manage billing
              </p>
            </div>
            <LoadingButton
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={handleManageBilling}
              loading={isLoading}
            >
              <span className="mr-1">Manage Billing</span>
              <ExternalLink className="h-3 w-3" />
            </LoadingButton>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        {subscription.cancelAtPeriodEnd ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Resume Subscription</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Resume Subscription</AlertDialogTitle>
                <AlertDialogDescription>
                  Your subscription will continue and you won&apos;t lose access
                  to any features. You&apos;ll be billed on your regular billing
                  date.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <LoadingButton
                    loading={isReactivating}
                    onClick={handleReactivateSubscription}
                  >
                    Resume Subscription
                  </LoadingButton>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : subscription.status === SubscriptionStatus.ACTIVE ||
          subscription.status === SubscriptionStatus.TRIALING ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Cancel Subscription</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                <AlertDialogDescription>
                  Your subscription will continue until the end of the current
                  billing period. After that, you&apos;ll lose access to premium
                  features.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <LoadingButton
                    variant="destructive"
                    loading={isCanceling}
                    onClick={handleCancelSubscription}
                  >
                    Cancel Subscription
                  </LoadingButton>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </CardFooter>
    </Card>
  );
}
