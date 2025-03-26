'use client';

import { PricingSection } from '@/components/marketing/PricingSection';
import { usePricingTiers } from '@/hooks/usePricingTiers';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { useEffect, useState } from 'react';

export default function PricingPage() {
  // Use a state to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  const { pricingTiers, isLoading, error } = usePricingTiers();

  // Set mounted state after component mounts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show nothing during SSR to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">Pricing Plans</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <LoadingSkeleton type="card" count={2} />
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">Pricing Plans</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <LoadingSkeleton type="card" count={2} />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Pricing Plans</h1>
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          Error loading pricing plans: {error}
        </div>
      </div>
    );
  }

  // Show pricing section with loaded tiers
  return (
    <PricingSection
      title="Simple, Transparent Pricing"
      description="Choose the plan that's right for you"
      tiers={pricingTiers}
    />
  );
}
