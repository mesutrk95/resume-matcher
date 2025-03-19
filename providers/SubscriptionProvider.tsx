import { Subscription } from "@prisma/client";
import React, { createContext, useContext } from "react";

const SubscriptionContext = createContext<{
  subscription: Subscription | null;
}>({
  subscription: null,
});

export const SubscriptionProvider = ({
  children,
  subscription,
}: {
  children: React.ReactNode;
  subscription: Subscription;
}) => {
  return (
    <SubscriptionContext.Provider value={{ subscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  return useContext(SubscriptionContext);
};
