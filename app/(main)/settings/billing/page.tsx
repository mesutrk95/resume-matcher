"use client";

import { getUserSubscription } from "@/actions/subscription";
import { CurrentSubscription } from "@/components/subscription/current-subscription";
import { SubscriptionPlans } from "@/components/subscription/subscription-plans";
import { useEffect, useState } from "react";
import { Subscription } from "@prisma/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  useEffect(() => {
    const fetchSubscription = async () => {
      setIsLoading(true);
      try {
        const subscription = await getUserSubscription();
        setSubscription(subscription);
      } catch (error) {
        toast.error("An error occurred while fetching subscription details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  useEffect(() => {
    if (success) {
      toast.success("Your subscription has been processed successfully!");
    }
    if (canceled) {
      toast.info("Subscription checkout was canceled");
    }
  }, [success, canceled]);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription and billing details
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Tabs defaultValue={subscription && subscription.subscriptionId ? "current" : "plans"}>
          <TabsList className="mb-6">
            {subscription && subscription.subscriptionId && (
              <TabsTrigger value="current">Current Subscription</TabsTrigger>
            )}
            <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          </TabsList>
          
          {subscription && subscription.subscriptionId && (
            <TabsContent value="current" className="space-y-6">
              <CurrentSubscription subscription={subscription} />
            </TabsContent>
          )}
          
          <TabsContent value="plans">
            <SubscriptionPlans currentSubscription={subscription} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}