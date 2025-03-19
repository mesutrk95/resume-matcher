'use server';

import { getStripeServer } from '@/lib/stripe';

// Helper function to convert Stripe object to plain object
function stripeMethods(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle primitive values
  if (typeof obj !== 'object') {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(stripeMethods);
  }

  // Handle plain objects, strip methods and convert to plain objects
  const plainObject: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Skip functions and inherit properties
      if (typeof obj[key] !== 'function') {
        plainObject[key] = stripeMethods(obj[key]);
      }
    }
  }

  return plainObject;
}

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

    // Convert product to a plain object to avoid passing methods to client components
    const plainProduct = stripeMethods(product);

    return {
      success: true,
      product: plainProduct,
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
