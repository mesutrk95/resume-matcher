import { SubscriptionStatus } from '@prisma/client';

export const TRIAL_PERIOD_DAYS = 3;

export function mapStripeStatusToDBStatus(stripeStatus: string): SubscriptionStatus {
  switch (stripeStatus) {
    case 'active':
      return SubscriptionStatus.ACTIVE;
    case 'canceled':
      return SubscriptionStatus.CANCELED;
    case 'incomplete':
      return SubscriptionStatus.INCOMPLETE;
    case 'incomplete_expired':
      return SubscriptionStatus.INCOMPLETE_EXPIRED;
    case 'past_due':
      return SubscriptionStatus.PAST_DUE;
    case 'trialing':
      return SubscriptionStatus.TRIALING;
    case 'unpaid':
      return SubscriptionStatus.UNPAID;
    default:
      return SubscriptionStatus.ACTIVE;
  }
}

export type SubscriptionInterval = 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'yearly';

export const PRICE_MAPPING: Record<SubscriptionInterval, string | undefined> = {
  weekly: process.env.STRIPE_BASIC_PRICE_WEEKLY,
  monthly: process.env.STRIPE_BASIC_PRICE_MONTHLY,
  quarterly: process.env.STRIPE_BASIC_PRICE_QUARTERLY,
  biannual: process.env.STRIPE_BASIC_PRICE_BIANNUAL,
  yearly: process.env.STRIPE_BASIC_PRICE_YEARLY,
};
