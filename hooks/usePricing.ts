'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Define types for Stripe price and product data
interface StripePrice {
  id: string;
  unit_amount: number;
  currency: string;
  recurring: {
    interval: string;
    interval_count: number;
  };
  product: string;
  active: boolean;
}

interface StripeProduct {
  id: string;
  name: string;
  description: string;
  active: boolean;
  metadata: Record<string, string>;
}

interface PricingData {
  prices: Record<string, number>;
  product: StripeProduct | null;
  isLoading: boolean;
  error: string | null;
}

// Default prices to use if API fails
const DEFAULT_PRICES = {
  weekly: 4.99,
  monthly: 12.99,
  quarterly: 29.99,
  biannual: 49.99,
  yearly: 89.99,
};

export function usePricing() {
  const [pricingData, setPricingData] = useState<PricingData>({
    prices: DEFAULT_PRICES,
    product: null,
    isLoading: true,
    error: null,
  });

  // Use refs to track fetch status to prevent duplicate requests
  const hasFetchedRef = useRef(false);
  const fetchPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    const fetchPricingData = async () => {
      // If we're already fetching or have already fetched, do nothing
      if (fetchPromiseRef.current || hasFetchedRef.current) {
        return fetchPromiseRef.current;
      }

      const fetchPromise = new Promise<void>(async resolve => {
        try {
          // Make API call to fetch pricing data
          const response = await axios.get('/api/subscription/prices');

          if (response.data && response.data.prices && response.data.product) {
            // Map prices from API to our format
            const prices: Record<string, number> = {};

            response.data.prices.forEach((price: StripePrice) => {
              // Map Stripe's interval to our interval keys
              let intervalKey = price.recurring.interval;

              // Handle special cases based on interval count
              if (price.recurring.interval === 'month') {
                if (price.recurring.interval_count === 1)
                  intervalKey = 'monthly';
                if (price.recurring.interval_count === 3)
                  intervalKey = 'quarterly';
                if (price.recurring.interval_count === 6)
                  intervalKey = 'biannual';
              } else if (price.recurring.interval === 'week') {
                intervalKey = 'weekly';
              } else if (price.recurring.interval === 'year') {
                intervalKey = 'yearly';
              }

              // Convert cents to dollars
              prices[intervalKey] = price.unit_amount / 100;
            });

            setPricingData({
              prices,
              product: response.data.product,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          console.error('Error fetching pricing data:', error);
          setPricingData(prev => ({
            ...prev,
            isLoading: false,
            error: 'Failed to load pricing data. Using default values.',
          }));
        } finally {
          // Clear the promise reference after fetching
          fetchPromiseRef.current = null;
          hasFetchedRef.current = true;
          resolve();
        }
      });

      // Store the promise reference
      fetchPromiseRef.current = fetchPromise;
      return fetchPromise;
    };

    fetchPricingData();
  }, []);

  return pricingData;
}
