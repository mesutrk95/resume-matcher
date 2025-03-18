'use server';

import { getStripeServer } from '@/lib/stripe';

// Get subscription pricing data
export const getSubscriptionPrices = async () => {
  try {
    const stripe = getStripeServer();

    // Get the product ID from environment variable
    const productId = process.env.STRIPE_BASIC_PRODUCT_ID;

    if (!productId) {
      return {
        success: false,
        error: 'Product ID not configured',
      };
    }

    // Get product details
    const product = await stripe.products.retrieve(productId);

    // Get all active prices for this product
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
      expand: ['data.product'],
    });

    // Format the pricing data
    const formattedPrices: Record<string, number> = {};

    prices.data.forEach((price: any) => {
      // Map Stripe's interval to our interval keys
      let intervalKey = price.recurring.interval;

      // Handle special cases based on interval count
      if (price.recurring.interval === 'month') {
        if (price.recurring.interval_count === 1) intervalKey = 'monthly';
        if (price.recurring.interval_count === 3) intervalKey = 'quarterly';
        if (price.recurring.interval_count === 6) intervalKey = 'biannual';
      } else if (price.recurring.interval === 'week') {
        intervalKey = 'weekly';
      } else if (price.recurring.interval === 'year') {
        intervalKey = 'yearly';
      }

      // Convert cents to dollars
      formattedPrices[intervalKey] = price.unit_amount / 100;
    });

    return {
      success: true,
      product,
      prices: formattedPrices,
    };
  } catch (error: any) {
    console.error('Error fetching pricing data:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch pricing data',
    };
  }
};
