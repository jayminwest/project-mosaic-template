import { useState, useEffect } from "react";
import { UseSubscriptionReturn, SubscriptionPlan } from "@/types/subscription";
import { getServiceProvider } from "@/lib/services";
import { useAuth } from "./useAuth";

export function useSubscription(): UseSubscriptionReturn {
  const services = getServiceProvider();
  const paymentService = services.getPaymentService();
  const { session, user } = useAuth();
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | undefined>(undefined);

  // Fetch available subscription plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoading(true);
        const fetchedPlans = await paymentService.getSubscriptionPlans();
        setPlans(fetchedPlans);
      } catch (error: any) {
        console.error("Error fetching subscription plans:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Fetch current plan when user is available
  useEffect(() => {
    const fetchCurrentPlan = async () => {
      if (user?.user_id) {
        try {
          const plan = await paymentService.getCurrentPlan(user.user_id);
          setCurrentPlan(plan);
        } catch (error: any) {
          console.error("Error fetching current plan:", error);
        }
      }
    };

    fetchCurrentPlan();
  }, [user]);

  const manageSubscription = async (accessToken: string, priceId?: string) => {
    try {
      const response = await paymentService.createCheckoutSession(accessToken, priceId);
      
      if (!response.success) {
        throw new Error(response.error);
      }
      
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error: any) {
      console.error("Error managing subscription:", error);
      setError(error.message);
      throw error;
    }
  };

  const getCurrentPlan = async (): Promise<SubscriptionPlan | undefined> => {
    if (!user?.user_id) return undefined;
    
    try {
      return await paymentService.getCurrentPlan(user.user_id);
    } catch (error: any) {
      console.error("Error getting current plan:", error);
      setError(error.message);
      return undefined;
    }
  };

  return {
    manageSubscription,
    getCurrentPlan,
    plans,
    currentPlan,
    isLoading,
    error,
  };
}
