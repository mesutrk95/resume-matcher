'use server';

import { ForbiddenException } from '@/lib/exceptions';
import { currentUser } from '@/lib/auth';
import { getStripeServer } from '@/lib/stripe';
import { getSubscriptionByUserId } from './customer';
import { BadRequestException, InternalServerErrorException } from '@/lib/exceptions';
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
  billingPeriod?: string;
};

export const getPaymentHistory = async (): Promise<{
  payments: PaymentHistoryItem[];
  error?: string;
}> => {
  try {
    const user = await currentUser();
    if (user.id) {
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

    // Get plan information to create better descriptions
    let planName = 'Subscription';
    let planInterval = '';

    if (subscription.priceId) {
      try {
        const price = await stripe.prices.retrieve(subscription.priceId);
        if (price.product && typeof price.product !== 'string') {
          planName = (price.product as any).name || 'Minova Pro';
        } else if (typeof price.product === 'string') {
          const product = await stripe.products.retrieve(price.product);
          planName = product.name || 'Minova Pro';
        }

        if (price.recurring) {
          const interval = price.recurring.interval;
          const count = price.recurring.interval_count || 1;

          if (count === 1) {
            planInterval = interval;
          } else {
            planInterval = `${count}-${interval}`;
          }
        }
      } catch (error) {
        Logger.warn('Error fetching price information', {
          priceId: subscription.priceId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Helper to format billing period
    const formatBillingPeriod = (start: number, end: number) => {
      const startDate = new Date(start * 1000);
      const endDate = new Date(end * 1000);
      return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    };

    // Convert past charges to PaymentHistoryItems
    const pastPayments = charges.data.map(charge => {
      const relatedInvoice = pastInvoices.data.find(invoice => invoice.charge === charge.id);

      let description = 'Subscription payment';
      let billingPeriod = undefined;

      if (relatedInvoice) {
        if (relatedInvoice.billing_reason === 'subscription_create') {
          description = `${planName} - Initial payment`;
        } else if (relatedInvoice.billing_reason === 'subscription_cycle') {
          description = `${planName} - ${planInterval} renewal`;
        }

        if (relatedInvoice.lines?.data[0]?.period) {
          const { start, end } = relatedInvoice.lines.data[0].period;
          billingPeriod = formatBillingPeriod(start, end);
        }
      }

      return {
        id: charge.id,
        amount: charge.amount / 100,
        currency: charge.currency.toUpperCase(),
        status: charge.status,
        date: new Date(charge.created * 1000),
        description: description,
        invoiceUrl: relatedInvoice?.hosted_invoice_url,
        receiptUrl: charge.receipt_url,
        isUpcoming: false,
        billingPeriod,
      };
    });

    // Create upcoming payment item if available
    const upcomingPayments: PaymentHistoryItem[] = [];
    if (upcomingInvoice) {
      let upcomingDescription = `${planName} - Upcoming ${planInterval} payment`;
      let billingPeriod = undefined;

      if (upcomingInvoice.lines?.data[0]?.period) {
        const { start, end } = upcomingInvoice.lines.data[0].period;
        billingPeriod = formatBillingPeriod(start, end);
      }

      upcomingPayments.push({
        id: `upcoming_${new Date().getTime()}`,
        amount: upcomingInvoice.amount_due / 100,
        currency: upcomingInvoice.currency.toUpperCase(),
        status: 'upcoming',
        date: new Date((upcomingInvoice.next_payment_attempt || upcomingInvoice.created) * 1000),
        description: upcomingDescription,
        isUpcoming: true,
        billingPeriod,
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
