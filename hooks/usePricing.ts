'use client';

import { getSubscriptionPrices } from '@/actions/subscription/pricing';
import { useState, useEffect } from 'react';

// Default prices to use if API fails
const DEFAULT_PRICES = {
  weekly: 4.99,
  monthly: 12.99,
  quarterly: 29.99,
  biannual: 49.99,
  yearly: 89.99,
};

interface PricingData {
  prices: Record<string, number>;
  product: any | null;
  isLoading: boolean;
  error: string | null;
}

export function usePricing() {
  const [pricingData, setPricingData] = useState<PricingData>({
    prices: DEFAULT_PRICES,
    product: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        const result = await getSubscriptionPrices();

        if (result.success) {
          setPricingData({
            prices: result.prices || DEFAULT_PRICES,
            product: result.product || null,
            isLoading: false,
            error: null,
          });
        } else {
          setPricingData({
            prices: DEFAULT_PRICES,
            product: null,
            isLoading: false,
            error:
              result.error ||
              'Failed to load pricing data. Using default values.',
          });
        }
      } catch (error: any) {
        console.error('Error fetching pricing data:', error);
        setPricingData({
          prices: DEFAULT_PRICES,
          product: null,
          isLoading: false,
          error:
            error.message ||
            'Error loading pricing data. Using default values.',
        });
      }
    };

    fetchPricingData();
  }, []);

  return pricingData;
}
