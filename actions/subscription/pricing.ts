'use server';

import { getStripeServer } from '@/lib/stripe';
import { BadRequestException, InternalServerErrorException } from '@/lib/exceptions';
import Logger from '@/lib/logger';

function stripeMethods(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(stripeMethods);
  }

  const plainObject: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof obj[key] !== 'function') {
        plainObject[key] = stripeMethods(obj[key]);
      }
    }
  }

  return plainObject;
}

export const getSubscriptionPrices = async () => {
  const stripe = getStripeServer();
  if (!stripe) {
    throw new InternalServerErrorException('Failed to initialize Stripe');
  }

  const productId = process.env.STRIPE_BASIC_PRODUCT_ID;
  if (!productId) {
    throw new BadRequestException('Product ID not configured');
  }

  let product;
  try {
    product = await stripe.products.retrieve(productId);
  } catch (error: any) {
    Logger.error('Error fetching product details', {
      productId,
      error: error.message,
    });
    throw new InternalServerErrorException('Failed to fetch product details');
  }

  let prices;
  try {
    prices = await stripe.prices.list({
      product: productId,
      active: true,
      expand: ['data.product'],
    });
  } catch (error: any) {
    Logger.error('Error fetching prices', {
      productId,
      error: error.message,
    });
    throw new InternalServerErrorException('Failed to fetch pricing data');
  }

  const formattedPrices: Record<string, number> = {};

  prices.data.forEach((price: any) => {
    let intervalKey = price.recurring.interval;

    if (price.recurring.interval === 'month') {
      if (price.recurring.interval_count === 1) intervalKey = 'monthly';
      if (price.recurring.interval_count === 3) intervalKey = 'quarterly';
      if (price.recurring.interval_count === 6) intervalKey = 'biannual';
    } else if (price.recurring.interval === 'week') {
      intervalKey = 'weekly';
    } else if (price.recurring.interval === 'year') {
      intervalKey = 'yearly';
    }

    formattedPrices[intervalKey] = price.unit_amount / 100;
  });

  const plainProduct = stripeMethods(product);

  return {
    success: true,
    product: plainProduct,
    prices: formattedPrices,
  };
};
