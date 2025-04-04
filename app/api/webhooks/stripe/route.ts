import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { getStripeServer } from '@/lib/stripe';
import { updateSubscriptionInDatabase } from '@/actions/subscription/utils';
import { SubscriptionStatus } from '@prisma/client';
import { db } from '@/lib/db';
import Stripe from 'stripe';
import {
  sendPaymentFailedEmail,
  sendSubscriptionCanceledEmail,
  sendSubscriptionWelcomeEmail,
  sendTrialEndingEmail,
  sendWinBackEmail,
} from '@/services/mail';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;
  const stripe = getStripeServer();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error: any) {
    console.error(`Webhook signature verification failed: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  console.log(`Processing Stripe webhook: ${event.type}`);

  try {
    // Handle different event types with proper typing
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === 'subscription' && session.subscription) {
          const subscriptionId =
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription.id;

          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId,
          );

          // Get user ID from metadata
          const userId =
            subscription.metadata.userId || session.metadata?.userId;

          if (userId) {
            await updateSubscriptionInDatabase(
              userId,
              subscription.id,
              subscription.items.data[0].price.id,
              mapStripeStatusToDBStatus(subscription.status),
              new Date(subscription.current_period_start * 1000),
              new Date(subscription.current_period_end * 1000),
            );

            // Get user to send email
            const user = await db.user.findUnique({
              where: { id: userId },
            });

            if (user && user.email) {
              // Send welcome email for new subscribers
              await sendSubscriptionWelcomeEmail(
                user.email,
                user.name || 'there',
                new Date(subscription.trial_end! * 1000),
              );
            }
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;

        if (invoice.subscription) {
          const subscriptionId =
            typeof invoice.subscription === 'string'
              ? invoice.subscription
              : invoice.subscription.id;

          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId,
          );

          const userId = subscription.metadata.userId;

          if (userId) {
            await updateSubscriptionInDatabase(
              userId,
              subscription.id,
              subscription.items.data[0].price.id,
              mapStripeStatusToDBStatus(subscription.status),
              new Date(subscription.current_period_start * 1000),
              new Date(subscription.current_period_end * 1000),
            );
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;

        if (invoice.subscription) {
          const subscriptionId =
            typeof invoice.subscription === 'string'
              ? invoice.subscription
              : invoice.subscription.id;

          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId,
          );
          const userId = subscription.metadata.userId;

          if (userId) {
            // Get user to send email
            const user = await db.user.findUnique({
              where: { id: userId },
            });

            if (user && user.email) {
              // Get invoice URL so user can update payment method
              const hostedInvoiceUrl = invoice.hosted_invoice_url || '';

              // Send failed payment notification
              await sendPaymentFailedEmail(
                user.email,
                user.name || 'there',
                invoice.amount_due / 100, // Convert from cents to dollars
                invoice.currency,
                hostedInvoiceUrl,
                invoice.attempt_count || 1,
                invoice.next_payment_attempt
                  ? new Date(invoice.next_payment_attempt * 1000)
                  : undefined,
              );
            }
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const previousAttributes = event.data
          .previous_attributes as Partial<Stripe.Subscription>;
        const userId = subscription.metadata.userId;

        if (userId) {
          await updateSubscriptionInDatabase(
            userId,
            subscription.id,
            subscription.items.data[0].price.id,
            mapStripeStatusToDBStatus(subscription.status),
            new Date(subscription.current_period_start * 1000),
            new Date(subscription.current_period_end * 1000),
          );
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.userId;

        if (userId) {
          await updateSubscriptionInDatabase(
            userId,
            subscription.id,
            subscription.items.data[0].price.id,
            SubscriptionStatus.CANCELED,
            new Date(subscription.current_period_start * 1000),
            new Date(subscription.current_period_end * 1000),
          );

          // Get user to send email
          const user = await db.user.findUnique({
            where: { id: userId },
          });

          if (user && user.email) {
            // Send cancellation email
            await sendSubscriptionCanceledEmail(
              user.email,
              user.name || 'there',
              new Date(subscription.current_period_end * 1000),
            );

            // Schedule a win-back email (send it after 7 days)
            // Since we're not using a scheduler, we can't actually schedule this
            // In a real application, you would use a CRON job or a task queue

            // For demo purposes, we'll just log it
            console.log(
              `Should send win-back email to ${user.email} in 7 days`,
            );
          }
        }
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.userId;

        if (userId) {
          // Get user to send email
          const user = await db.user.findUnique({
            where: { id: userId },
          });

          if (user && user.email) {
            await sendTrialEndingEmail(
              user.email,
              user.name || 'there',
              new Date(subscription.trial_end! * 1000),
              subscription.items.data[0].price.unit_amount! / 100, // Convert from cents to dollars
              subscription.currency,
            );
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new NextResponse(null, { status: 200 });
  } catch (error: any) {
    console.error(`Error processing Stripe webhook: ${error.message}`);
    return new NextResponse(`Webhook processing error: ${error.message}`, {
      status: 500,
    });
  }
}

// Helper to map Stripe subscription status to our database status
function mapStripeStatusToDBStatus(stripeStatus: string): SubscriptionStatus {
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
