"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { usePricingTiers } from "@/hooks/usePricingTiers";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface PricingSectionProps {
  title: string;
  description: string;
  tiers?: any[]; // Optional prop for static tiers
}

export function PricingSection({ title, description, tiers: staticTiers }: PricingSectionProps) {
  // Use a state to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  const { pricingTiers, isLoading, error } = usePricingTiers();
  
  // Use either the fetched tiers or static tiers passed as props
  const tiers = staticTiers || pricingTiers;

  const router = useRouter();
  const supabase = createClientComponentClient();
  
  // Set mounted state after component mounts
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const handleSubscribeClick = async (priceId: string) => {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // User is not authenticated, redirect to login with return URL
      router.push(`/login?returnTo=/profile?subscribe=${priceId}`);
      return;
    }
    
    // User is authenticated, proceed with subscription flow
    router.push(`/profile?subscribe=${priceId}`);
  };

  // Show nothing during SSR to prevent hydration mismatch
  if (!isMounted) {
    return (
      <section className="py-12 md:py-24 w-full">
        <div className="container px-4 md:px-6 mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">{title}</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                {description}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <LoadingSkeleton type="card" count={3} />
          </div>
        </div>
      </section>
    );
  }

  // Show loading state
  if (isLoading && !staticTiers) {
    return (
      <section className="py-12 md:py-24 w-full">
        <div className="container px-4 md:px-6 mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">{title}</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                {description}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <LoadingSkeleton type="card" count={3} />
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error && !staticTiers) {
    return (
      <section className="py-12 md:py-24 w-full">
        <div className="container px-4 md:px-6 mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">{title}</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                {description}
              </p>
            </div>
          </div>
          <div className="p-4 bg-red-50 text-red-700 rounded-md mt-8 text-center">
            Error loading pricing plans: {error}
          </div>
        </div>
      </section>
    );
  }
  // If we have no tiers to display, show a message
  if (!tiers || tiers.length === 0) {
    return (
      <section className="py-12 md:py-24 w-full">
        <div className="container px-4 md:px-6 mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">{title}</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                {description}
              </p>
            </div>
          </div>
          <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md mt-8 text-center">
            No pricing plans are currently available. Please check back later.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-24 w-full">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">{title}</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              {description}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {tiers.map((tier, index) => (
            <div 
              key={index} 
              className={`flex flex-col p-6 bg-background border rounded-lg shadow-sm ${
                tier.highlighted ? "relative" : ""
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Popular
                </div>
              )}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{tier.name}</h3>
                <p className="text-muted-foreground">{tier.description}</p>
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className="text-muted-foreground">/{tier.interval}</span>
                {tier.trialPeriod && (
                  <div className="mt-1 text-sm text-primary">
                    {tier.trialPeriod} days free trial
                  </div>
                )}
              </div>
              <ul className="mt-6 space-y-2">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className={`w-5 h-5 mr-2 ${
                        feature.included ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {feature.included ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      )}
                    </svg>
                    <span className={feature.included ? "" : "text-muted-foreground"}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Button 
                  variant={tier.buttonVariant || "default"} 
                  className="w-full"
                  onClick={() => handleSubscribeClick(tier.priceId)}
                >
                  {tier.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
