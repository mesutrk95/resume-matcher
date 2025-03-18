import { Stripe, loadStripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);
  }
  return stripePromise;
};

import { Stripe as StripeServer } from 'stripe';

let stripe: StripeServer | null = null;

export const getStripeServer = () => {
  if (!stripe) {
    stripe = new StripeServer(process.env.STRIPE_API_KEY!, {
      apiVersion: '2025-02-24.acacia',
    });
  }
  return stripe;
};
