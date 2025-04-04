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
  invoiceUrl?: string | null;
  receiptUrl?: string | null;
  isUpcoming?: boolean;
};

export const getPaymentHistory = async (): Promise<{
  payments: PaymentHistoryItem[];
  error?: string;
}> => {
  try {
    const user = await currentUser();
    if (!user?.id) {
      throw new BadRequestException('User not authenticated');
    }

    const subscription = await getSubscriptionByUserId(user.id);
    if (!subscription?.customerId) {
      return { payments: [] };
    }

    const stripe = getStripeServer();
    if (!stripe) {
      throw new InternalServerErrorException('Failed to initialize Stripe');
    }

    // Get past charges
    const charges = await stripe.charges.list({
      customer: subscription.customerId,
      limit: 20,
    });

    // Get invoices for additional details and upcoming invoices
    const pastInvoices = await stripe.invoices.list({
      customer: subscription.customerId,
      limit: 20,
    });

    // Get upcoming invoice
    let upcomingInvoice = null;
    try {
      if (subscription.subscriptionId) {
        upcomingInvoice = await stripe.invoices.retrieveUpcoming({
          customer: subscription.customerId,
          subscription: subscription.subscriptionId,
        });
      }
    } catch (error) {
      Logger.warn('Error fetching upcoming invoice, might not exist', {
        customerId: subscription.customerId,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Convert past charges to PaymentHistoryItems
    const pastPayments = charges.data.map(charge => {
      const relatedInvoice = pastInvoices.data.find(
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
        isUpcoming: false,
      };
    });

    // Create upcoming payment item if available
    const upcomingPayments: PaymentHistoryItem[] = [];
    if (upcomingInvoice) {
      upcomingPayments.push({
        id: `upcoming_${new Date().getTime()}`,
        amount: upcomingInvoice.amount_due / 100,
        currency: upcomingInvoice.currency.toUpperCase(),
        status: 'upcoming',
        date: new Date(
          (upcomingInvoice.next_payment_attempt || upcomingInvoice.created) *
            1000,
        ),
        description: `Upcoming payment for ${
          subscription.priceId
            ? subscription.priceId.split('_').pop()
            : 'subscription'
        }`,
        isUpcoming: true,
      });
    }

    const allPayments = [...upcomingPayments, ...pastPayments];

    return { payments: allPayments };
  } catch (error) {
    Logger.error('Error fetching payment history', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new InternalServerErrorException('Failed to fetch payment history');
  }
};
