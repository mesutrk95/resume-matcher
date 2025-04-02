"use client";

import { CurrentSubscription } from "@/components/subscription/current-subscription";
import { SubscriptionPlans } from "@/components/subscription/subscription-plans";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSubscription } from "@/providers/SubscriptionProvider";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getSubscriptionPrices } from "@/actions/subscription/pricing";
import { verifySubscriptionFromSession } from "@/actions/subscription/session";
import { PaymentHistory } from "@/components/subscription/payment-history";

export default function BillingPage() {
  const {
    subscription,
    isLoading: isLoadingSubscription,
    fetchSubscription,
  } = useSubscription();
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);
  const [isVerifyingSession, setIsVerifyingSession] = useState(false);
  const [pricingData, setPricingData] = useState<{
    prices: Record<string, number>;
    product: any | null;
    error: string | null;
  }>({
    prices: {},
    product: null,
    error: null,
  });

  // Get URL parameters
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");
  const sessionId = searchParams.get("session_id");

  // Combined useEffect for URL parameters, session verification, and toast messages
  useEffect(() => {
    // Handle URL parameters and show relevant toasts
    if (sessionId && success === "true") {
      // Session ID is present - verify the session
      const checkSession = async () => {
        try {
          setIsVerifyingSession(true);
          const result = await verifySubscriptionFromSession(sessionId);

          if (result.success) {
            // Clean up URL parameters
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);

            toast.success("Subscription activated successfully!");

            // Reload subscription data
            fetchSubscription();
          } else {
            toast.error("Failed to verify subscription");
          }
        } catch (error: any) {
          toast.error(error.message || "An unexpected error occurred");
        } finally {
          setIsVerifyingSession(false);
        }
      };

      checkSession();
    } else if (success && !sessionId) {
      // Success parameter without session ID
      toast.success("Your subscription is being processed...");
    } else if (canceled) {
      // Canceled parameter is present
      toast.info("Subscription checkout was canceled");

      // Clean up URL parameters after showing toast
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [sessionId, success, canceled, fetchSubscription]);

  // Load pricing data on component mount
  useEffect(() => {
    const loadPricingData = async () => {
      try {
        setIsLoadingPrices(true);
        const result = await getSubscriptionPrices();

        if (result.success) {
          setPricingData({
            prices: result.prices || {},
            product: result.product || null,
            error: null,
          });
        } else {
          setPricingData({
            prices: {},
            product: null,
            error: "Failed to load pricing data.",
          });
        }
      } catch (error: any) {
        setPricingData({
          prices: {},
          product: null,
          error: error.message || "An unexpected error occurred.",
        });
      } finally {
        setIsLoadingPrices(false);
      }
    };

    loadPricingData();
  }, []);

  // Loading indicator
  if (isLoadingSubscription || isVerifyingSession) {
    return (
      <div className="">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Subscription Management
          </h1>
          <p className="text-muted-foreground">
            Manage your subscription, payment methods, and billing information
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Subscription Management
        </h1>
        <p className="text-muted-foreground">
          Manage your subscription, payment methods, and billing information
        </p>
      </div>

      {pricingData.error && (
        <Alert variant="default" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>{pricingData.error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue={subscription ? "current" : "plans"} className="mt-8">
        <TabsList className=" mb-6 border-b w-full" variant={"bottomline"}>
          {subscription && (
            <TabsTrigger
              id="current-tab"
              value="current"
              variant={"bottomline"}
            >
              Current Subscription
            </TabsTrigger>
          )}
          <TabsTrigger id="plans-tab" value="plans" variant={"bottomline"}>
            Subscription Plans
          </TabsTrigger>
          <TabsTrigger
            id="payments-tab"
            value="payments"
            variant={"bottomline"}
          >
            Payment History
          </TabsTrigger>
        </TabsList>

        {subscription && (
          <TabsContent value="current" className="space-y-6">
            <CurrentSubscription subscription={subscription} />
          </TabsContent>
        )}

        <TabsContent value="plans">
          <SubscriptionPlans
            currentSubscription={subscription}
            pricingData={pricingData.prices}
            productInfo={pricingData.product}
            isLoadingPrices={isLoadingPrices}
          />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
