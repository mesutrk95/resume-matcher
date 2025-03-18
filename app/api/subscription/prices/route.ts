// app/api/subscription/prices/route.ts
import { NextResponse } from 'next/server';
import { getStripeServer } from '@/lib/stripe';
import { withErrorHandling } from '@/lib/api-error-handler';

// GET /api/subscription/prices
export const GET = withErrorHandling(async () => {
  const stripe = getStripeServer();

  // Get the product ID from environment variable
  const productId = process.env.STRIPE_BASIC_PRODUCT_ID;

  if (!productId) {
    return NextResponse.json(
      { error: 'Product ID not configured' },
      { status: 500 },
    );
  }

  // Get product details
  const product = await stripe.products.retrieve(productId);

  // Get all active prices for this product
  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    expand: ['data.product'],
  });

  return NextResponse.json({
    product,
    prices: prices.data,
  });
});
