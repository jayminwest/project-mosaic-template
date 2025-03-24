import { useState, useEffect } from "react";
import { UseSubscriptionReturn } from "@/types/subscription";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceId: string;
  price: number;
  currency: string;
  interval: string;
  planType: string;
}

export function useSubscription(): UseSubscriptionReturn {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  // Fetch available subscription plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/list-subscription-plans`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch subscription plans");
        }

        const data = await response.json();
        setPlans(data.plans || []);
      } catch (error: any) {
        console.error("Error fetching subscription plans:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const manageSubscription = async (accessToken: string, priceId?: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-stripe-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            priceId: priceId,
          }),
        }
      );

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      window.location.href = data.url;
    } catch (error: any) {
      console.error("Error managing subscription:", error);
      setError(error.message);
      throw error;
    }
  };

  return {
    manageSubscription,
    plans,
    isLoading,
    error,
  };
}
