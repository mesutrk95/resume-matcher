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
import { format } from 'date-fns';
import { Badge } from '../ui/badge';
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
import { LoadingButton } from '../ui/loading-button';
import {
  CreditCard,
  ExternalLink,
  AlertTriangle,
  CalendarIcon,
  ClockIcon,
  CheckCircle2,
  RefreshCw,
  Package,
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface CurrentSubscriptionProps {
  subscription: Subscription;
}

// These are the actual variants supported by your Badge component
type BadgeVariant = 'default' | 'destructive' | 'outline' | 'secondary';

export function CurrentSubscription({
  subscription: initialSubscription,
}: CurrentSubscriptionProps) {
  // Use the subscription hook for enhanced functionality
  const {
    subscription,
    isCanceling,
    isReactivating,
    isRedirectingToPortal,
    handleCancelSubscription,
    handleReactivateSubscription,
    handleRedirectToPortal,
  } = useSubscription();

  // Use the hook's subscription state if available, otherwise use prop
  const currentSubscription = subscription || initialSubscription;

  // Format date display
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMMM d, yyyy');
  };

  // Calculate days remaining in current period
  const calculateDaysRemaining = (endDate: Date | null | undefined) => {
    if (!endDate) return 0;

    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  // Helper to get status display
  const getStatusDisplay = () => {
    if (!currentSubscription) {
      return {
        label: 'No Subscription',
        description: 'You do not have an active subscription',
        variant: 'destructive' as BadgeVariant,
      };
    }

    if (currentSubscription.cancelAtPeriodEnd) {
      return {
        label: 'Canceling',
        description: `Your subscription will end on ${formatDate(
          currentSubscription.currentPeriodEnd,
        )}`,
        variant: 'secondary' as BadgeVariant,
      };
    }

    switch (currentSubscription.status) {
      case SubscriptionStatus.ACTIVE:
        return {
          label: 'Active',
          description: `Renews on ${formatDate(
            currentSubscription.currentPeriodEnd,
          )}`,
          variant: 'default' as BadgeVariant,
        };
      case SubscriptionStatus.TRIALING:
        return {
          label: 'Trial',
          description: `Trial ends on ${formatDate(
            currentSubscription.currentPeriodEnd,
          )}`,
          variant: 'outline' as BadgeVariant,
        };
      case SubscriptionStatus.CANCELED:
        return {
          label: 'Canceled',
          description: `Access until ${formatDate(
            currentSubscription.currentPeriodEnd,
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
          label: currentSubscription.status,
          description: '',
          variant: 'secondary' as BadgeVariant,
        };
    }
  };

  // Helper to get the subscription plan name
  const getPlanName = () => {
    const priceId = currentSubscription?.priceId;
    if (!priceId) return 'Standard Plan';

    // Extract plan type from price ID (assuming naming convention in Stripe)
    if (priceId.includes('weekly')) return 'Weekly Plan';
    if (priceId.includes('monthly')) return 'Monthly Plan';
    if (priceId.includes('quarterly')) return 'Quarterly Plan';
    if (priceId.includes('biannual')) return '6-Month Plan';
    if (priceId.includes('yearly')) return 'Annual Plan';

    return 'Standard Plan';
  };

  // If no subscription exists
  if (!currentSubscription) {
    return (
      <Card className="w-full">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>No Subscription</CardTitle>
              <CardDescription>
                You don&apos;t have an active subscription
              </CardDescription>
            </div>
            <Badge variant="destructive">Not Subscribed</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6 text-center">
          <p className="mb-6">
            Subscribe to access premium features and boost your job search
            success.
          </p>
          <Button
            onClick={() => document.getElementById('plans-tab')?.click()}
            className="mt-2"
          >
            View Subscription Plans
          </Button>
        </CardContent>
      </Card>
    );
  }

  const statusInfo = getStatusDisplay();
  const daysRemaining = calculateDaysRemaining(
    currentSubscription.currentPeriodEnd,
  );

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Subscription</CardTitle>
            <CardDescription>Manage your subscription settings</CardDescription>
          </div>
          <Badge variant={statusInfo.variant} className="capitalize">
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Plan info section */}
        <div className="flex justify-between items-center bg-white p-4 rounded-md border">
          <div className="flex items-center gap-3">
            <Package className="h-10 w-10 text-primary" />
            <div>
              <h3 className="font-bold text-lg">{getPlanName()}</h3>
              <p className="text-sm text-muted-foreground">
                {currentSubscription.status === SubscriptionStatus.TRIALING
                  ? 'Trial subscription with full access to all features'
                  : 'Full access to all premium features'}
              </p>
            </div>
          </div>
        </div>

        {/* Status section */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Status</h3>
            <p className="text-sm text-muted-foreground">
              {statusInfo.description}
            </p>
          </div>

          {daysRemaining > 0 && (
            <div
              className={`flex items-center px-4 py-2 rounded-md 
              ${
                currentSubscription.cancelAtPeriodEnd
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              <ClockIcon className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">
                {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
              </span>
            </div>
          )}
        </div>

        {/* Alert for past due status */}
        {currentSubscription.status === SubscriptionStatus.PAST_DUE && (
          <div className="flex items-start p-4 bg-amber-50 border border-amber-200 rounded-md">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-amber-800">
                Payment Failed
              </h4>
              <p className="text-sm text-amber-700">
                Your last payment attempt failed. Please update your payment
                method to continue your subscription.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 bg-amber-100 hover:bg-amber-200 border-amber-300"
                onClick={() => handleRedirectToPortal()}
              >
                Update Payment Method
              </Button>
            </div>
          </div>
        )}

        {/* Billing details section */}
        <div>
          <h3 className="text-sm font-medium mb-2">Subscription Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-md border p-4 bg-white">
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Current Period</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(currentSubscription.currentPeriodStart)} to{' '}
                    {formatDate(currentSubscription.currentPeriodEnd)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-md border p-4 bg-white">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Renewal Status</p>
                  <p className="text-xs text-muted-foreground">
                    {currentSubscription.cancelAtPeriodEnd
                      ? 'Will not renew automatically'
                      : currentSubscription.status ===
                        SubscriptionStatus.TRIALING
                      ? 'Will convert to paid subscription'
                      : 'Will renew automatically'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Billing management section */}
        <div className="rounded-md border p-4 bg-white">
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
              onClick={() => handleRedirectToPortal()}
              loading={isRedirectingToPortal}
            >
              <span className="mr-1">Manage Billing</span>
              <ExternalLink className="h-3 w-3" />
            </LoadingButton>
          </div>
        </div>

        {/* Change plan section for active subscriptions */}
        {(currentSubscription.status === SubscriptionStatus.ACTIVE ||
          currentSubscription.status === SubscriptionStatus.TRIALING) &&
          !currentSubscription.cancelAtPeriodEnd && (
            <div className="rounded-md border p-4 bg-white">
              <div className="flex items-center gap-4">
                <RefreshCw className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    Change Subscription Plan
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Upgrade, downgrade or switch billing cycle
                  </p>
                </div>
                <LoadingButton
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                  onClick={() => handleRedirectToPortal()}
                  loading={isRedirectingToPortal}
                >
                  <span className="mr-1">Change Plan</span>
                  <ExternalLink className="h-3 w-3" />
                </LoadingButton>
              </div>
            </div>
          )}
      </CardContent>

      <CardFooter className="flex justify-between border-t p-4 bg-gray-50 dark:bg-gray-900">
        {currentSubscription.cancelAtPeriodEnd ? (
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
        ) : currentSubscription.status === SubscriptionStatus.ACTIVE ||
          currentSubscription.status === SubscriptionStatus.TRIALING ? (
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
        ) : (
          <div></div> // Empty div as fallback for other states
        )}

        <Button
          variant="outline"
          onClick={() => handleRedirectToPortal()}
          disabled={isRedirectingToPortal}
        >
          View Billing History
        </Button>
      </CardFooter>
    </Card>
  );
}
