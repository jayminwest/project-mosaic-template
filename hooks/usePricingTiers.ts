'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingTier {
  name: string;
  description: string;
  price: string;
  interval: string;
  features: PricingFeature[];
  buttonText: string;
  buttonLink: string;
  buttonVariant?: "default" | "outline";
  highlighted?: boolean;
  priceId?: string;
  trialPeriod?: string | null;
}

// Create a stable Supabase client instance
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export function usePricingTiers() {
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchAttempted, setFetchAttempted] = useState(false);

  useEffect(() => {
    // Only fetch once
    if (fetchAttempted) return;
    
    async function fetchPricingTiers() {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await supabase.functions.invoke('list-subscription-plans', {
          body: { debug: true }
        });
        
        if (error) {
          console.error('Error fetching subscription plans:', error);
          setError(error.message || 'Failed to fetch subscription plans');
          setPricingTiers(createFallbackPlans());
          return;
        }
        
        if (!data || !data.plans || data.plans.length === 0) {
          console.log('No subscription plans found:', data);
          setPricingTiers(createFallbackPlans());
          return;
        }
        
        // Check if plans have valid data
        const validPlans = data.plans.filter((plan: any) => 
          plan && plan.name && plan.planType && typeof plan.price !== 'undefined'
        );
        
        if (validPlans.length === 0) {
          console.warn('No valid pricing plans found, using fallback plans');
          setPricingTiers(createFallbackPlans());
          return;
        }
        
        // Transform subscription plans to pricing tiers
        const allFeatures = Array.from(
          new Set(validPlans.flatMap((p: any) => p.features || []))
        );
        
        const tiers = validPlans.map((plan: any) => {
          // Create features array with included status
          const features: PricingFeature[] = allFeatures.map(featureText => ({
            text: featureText as string,
            included: (plan.features || []).includes(featureText)
          }));
          
          return {
            name: plan.name || 'Plan',
            description: plan.description || '',
            price: plan.price === 0 ? 'Free' : `$${plan.price}`,
            interval: plan.interval || 'month',
            features: features.length > 0 ? features : [{ text: 'Basic features', included: true }],
            buttonText: plan.price === 0 ? 'Sign Up' : 'Subscribe',
            buttonLink: plan.price === 0 ? '/auth/signup' : `/profile?subscribe=${plan.priceId}`,
            buttonVariant: plan.planType === 'premium' ? 'default' : 'outline',
            highlighted: plan.planType === 'premium',
            priceId: plan.priceId,
            trialPeriod: plan.metadata?.trial_period_days
          };
        });
        
        // Sort tiers: free first, then by price
        tiers.sort((a, b) => {
          if (a.price === 'Free') return -1;
          if (b.price === 'Free') return 1;
          return parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', ''));
        });
        
        setPricingTiers(tiers);
      } catch (err: any) {
        console.error('Error in usePricingTiers:', err);
        setError(err.message || 'An unexpected error occurred');
        setPricingTiers(createFallbackPlans());
      } finally {
        setIsLoading(false);
        setFetchAttempted(true);
      }
    }
    
    fetchPricingTiers();
  }, [fetchAttempted]); // Only depend on fetchAttempted, not supabase
  
  // Create fallback plans if API fails or returns empty
  function createFallbackPlans(): PricingTier[] {
    return [
      {
        name: 'Free',
        description: 'Basic features for personal use',
        price: 'Free',
        interval: 'month',
        features: [
          { text: 'Basic functionality', included: true },
          { text: 'Limited storage (10MB)', included: true },
          { text: 'Email support', included: true },
          { text: 'Advanced features', included: false },
          { text: 'Priority support', included: false }
        ],
        buttonText: 'Sign Up',
        buttonLink: '/auth/signup',
        buttonVariant: 'outline',
        highlighted: false,
        trialPeriod: null
      },
      {
        name: 'Premium',
        description: 'Advanced features for professionals',
        price: '$9.99',
        interval: 'month',
        features: [
          { text: 'Basic functionality', included: true },
          { text: 'Unlimited storage', included: true },
          { text: 'Email support', included: true },
          { text: 'Advanced features', included: true },
          { text: 'Priority support', included: true }
        ],
        buttonText: 'Subscribe',
        buttonLink: '/profile',
        buttonVariant: 'default',
        highlighted: true,
        trialPeriod: '7'
      }
    ];
  }

  return { pricingTiers, isLoading, error };
}
