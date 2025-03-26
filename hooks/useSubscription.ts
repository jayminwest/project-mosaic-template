import { useState, useEffect, useCallback } from "react";
import { UseSubscriptionReturn, SubscriptionPlan } from "@/types/subscription";
import { getServiceProvider } from "@/lib/services";
import { useAuth } from "./useAuth";
import { SubscriptionStatus, Invoice, PaymentResponse } from "@/lib/payment/payment-service";

export function useSubscription(): UseSubscriptionReturn {
  const services = getServiceProvider();
  const paymentService = services.getPaymentService();
  const { session, user } = useAuth();
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | undefined>(undefined);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

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

  // Fetch current plan and subscription status when user is available
  useEffect(() => {
    const fetchUserSubscriptionData = async () => {
      if (user?.user_id) {
        try {
          // Fetch current plan
          const plan = await paymentService.getCurrentPlan(user.user_id);
          setCurrentPlan(plan);
          
          // Fetch subscription status
          const status = await paymentService.getSubscriptionStatus(user.user_id);
          setSubscriptionStatus(status);
        } catch (error: any) {
          console.error("Error fetching subscription data:", error);
        }
      }
    };

    fetchUserSubscriptionData();
  }, [user]);

  const manageSubscription = async (accessToken: string, priceId?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if user is authenticated
      if (!session) {
        // If not authenticated and we're in a browser environment
        if (typeof window !== 'undefined') {
          // Store the price ID to use after login
          const returnUrl = `/profile?subscribe=${priceId}`;
          window.location.href = `/login?returnTo=${encodeURIComponent(returnUrl)}`;
          return;
        }
        throw new Error('User not authenticated');
      }
      
      // Create checkout session
      console.log("Creating Stripe checkout session for price:", priceId);
      const response = await paymentService.createCheckoutSession(accessToken, priceId);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create checkout session');
      }
      
      if (response.url) {
        window.location.href = response.url;
      } else {
        throw new Error('No redirect URL returned from payment service');
      }
    } catch (error: any) {
      console.error("Error managing subscription:", error);
      setError(error.message || 'An unknown error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
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

  const cancelSubscription = async (): Promise<PaymentResponse | undefined> => {
    if (!user?.user_id) {
      setError('You must be logged in to cancel a subscription');
      return undefined;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await paymentService.cancelSubscription(user.user_id);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to cancel subscription');
      }
      
      // Refresh subscription status
      const status = await paymentService.getSubscriptionStatus(user.user_id);
      setSubscriptionStatus(status);
      
      return response;
    } catch (error: any) {
      console.error("Error canceling subscription:", error);
      setError(error.message || 'An unknown error occurred. Please try again later.');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubscription = async (newPriceId: string): Promise<PaymentResponse | undefined> => {
    if (!user?.user_id) {
      setError('You must be logged in to update a subscription');
      return undefined;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await paymentService.updateSubscription(user.user_id, newPriceId);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update subscription');
      }
      
      // Refresh subscription status and current plan
      const status = await paymentService.getSubscriptionStatus(user.user_id);
      setSubscriptionStatus(status);
      
      const plan = await paymentService.getCurrentPlan(user.user_id);
      setCurrentPlan(plan);
      
      return response;
    } catch (error: any) {
      console.error("Error updating subscription:", error);
      setError(error.message || 'An unknown error occurred. Please try again later.');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const getInvoices = async (limit?: number): Promise<Invoice[]> => {
    if (!user?.user_id) return [];
    
    try {
      return await paymentService.getInvoices(user.user_id, limit);
    } catch (error: any) {
      console.error("Error getting invoices:", error);
      return [];
    }
  };

  const hasFeatureAccess = async (featureName: string): Promise<boolean> => {
    if (!user?.user_id) return false;
    
    try {
      return await paymentService.hasFeatureAccess(user.user_id, featureName);
    } catch (error: any) {
      console.error("Error checking feature access:", error);
      return false;
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Get subscription status
  const getSubscriptionStatus = useCallback(async () => {
    if (!user?.user_id) return { success: false, error: 'User not authenticated' };
    
    try {
      setIsLoading(true);
      
      // Use the payment service instead of direct Supabase call
      const status = await paymentService.getSubscriptionStatus(user.user_id);
      
      // Ensure we have a properly formatted status object
      const formattedStatus = {
        ...status,
        // If plan_type exists but no subscription object, this is a free or manually assigned plan
        isActive: status.isActive !== undefined ? status.isActive : true,
        willRenew: status.willRenew !== undefined ? status.willRenew : false,
        status: status.status || 'active',
        plan_type: status.plan_type || currentPlan?.planType || 'free'
      };
      
      console.log("Subscription status response:", formattedStatus);
      setSubscriptionStatus(formattedStatus);
      
      return { success: true, data: formattedStatus };
    } catch (error: any) {
      console.error("Error getting subscription status:", error);
      
      // Even on error, ensure we have a valid status object with defaults
      const fallbackStatus = {
        isActive: true,
        willRenew: false,
        status: 'active',
        plan_type: currentPlan?.planType || 'free'
      };
      
      setSubscriptionStatus(fallbackStatus);
      return { success: false, error: error.message, data: fallbackStatus };
    } finally {
      setIsLoading(false);
    }
  }, [user, paymentService, currentPlan]);
  
  // Helper functions for trial periods
  const isInTrialPeriod = useCallback(() => {
    return subscriptionStatus?.status === 'trialing';
  }, [subscriptionStatus]);
  
  const getTrialEndDate = useCallback(() => {
    if (!subscriptionStatus?.trialEnd) return null;
    return new Date(subscriptionStatus.trialEnd * 1000);
  }, [subscriptionStatus]);

  // Status helper methods
  const isSubscriptionActive = useCallback((): boolean => {
    return subscriptionStatus?.isActive || false;
  }, [subscriptionStatus]);

  const willSubscriptionRenew = useCallback((): boolean => {
    return subscriptionStatus?.willRenew || false;
  }, [subscriptionStatus]);

  const getSubscriptionEndDate = useCallback((): Date | undefined => {
    return subscriptionStatus?.currentPeriodEnd;
  }, [subscriptionStatus]);

  const isPremiumTier = useCallback((): boolean => {
    return currentPlan?.planType === 'premium' || currentPlan?.planType === 'enterprise';
  }, [currentPlan]);

  return {
    manageSubscription,
    getCurrentPlan,
    cancelSubscription,
    updateSubscription,
    getInvoices,
    hasFeatureAccess,
    clearError,
    getSubscriptionStatus,
    isInTrialPeriod,
    getTrialEndDate,
    isSubscriptionActive,
    willSubscriptionRenew,
    getSubscriptionEndDate,
    isPremiumTier,
    plans,
    currentPlan,
    isLoading,
    error,
    subscriptionStatus,
  };
}
