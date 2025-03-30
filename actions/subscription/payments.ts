// actions/subscription/payments.ts
'use server';

import { currentUser } from '@/lib/auth';
import { getStripeServer } from '@/lib/stripe';
import { getSubscriptionByUserId } from './customer';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@/lib/exceptions';
import Logger from '@/lib/logger';

export type PaymentHistoryItem = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  date: Date;
  description: string;
  invoiceUrl?: string;
  receiptUrl?: string;
};

export const getPaymentHistory = async (): Promise<PaymentHistoryItem[]> => {
  try {
    const user = await currentUser();
    if (!user?.id) {
      throw new BadRequestException('User not authenticated');
    }

    const subscription = await getSubscriptionByUserId(user.id);
    if (!subscription?.customerId) {
      return [];
    }

    const stripe = getStripeServer();
    if (!stripe) {
      throw new InternalServerErrorException('Failed to initialize Stripe');
    }

    const charges = await stripe.charges.list({
      customer: subscription.customerId,
      limit: 20,
    });

    const invoices = await stripe.invoices.list({
      customer: subscription.customerId,
      limit: 20,
    });

    const payments = charges.data.map(charge => {
      const relatedInvoice = invoices.data.find(
        invoice => invoice.charge === charge.id,
      );

      return {
        id: charge.id,
        amount: charge.amount / 100,
        currency: charge.currency.toUpperCase(),
        status: charge.status,
        date: new Date(charge.created * 1000),
        description: charge.description || 'Subscription payment',
        invoiceUrl: relatedInvoice?.hosted_invoice_url,
        receiptUrl: charge.receipt_url,
      };
    });

    return payments;
  } catch (error) {
    Logger.error('Error fetching payment history', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};
