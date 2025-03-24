import { SubscriptionPlan } from "@/types/subscription";

export interface PaymentResponse {
  success: boolean;
  error?: string;
  url?: string;
  data?: any;
}

export interface PaymentServiceConfig {
  apiUrl?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface PaymentProvider {
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  createCheckoutSession(accessToken: string, priceId?: string): Promise<PaymentResponse>;
  getCurrentPlan(userId: string): Promise<SubscriptionPlan | undefined>;
}

class StripePaymentProvider implements PaymentProvider {
  private config: PaymentServiceConfig;

  constructor(config: PaymentServiceConfig = {}) {
    this.config = {
      apiUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      successUrl: typeof window !== 'undefined' ? `${window.location.origin}/profile?success=true` : '',
      cancelUrl: typeof window !== 'undefined' ? `${window.location.origin}/profile?canceled=true` : '',
      ...config
    };
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await fetch(
        `${this.config.apiUrl}/functions/v1/list-subscription-plans`,
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
      return data.plans || [];
    } catch (error: any) {
      console.error("Error fetching subscription plans:", error);
      return [];
    }
  }

  async createCheckoutSession(accessToken: string, priceId?: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(
        `${this.config.apiUrl}/functions/v1/create-stripe-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            priceId,
            successUrl: this.config.successUrl,
            cancelUrl: this.config.cancelUrl,
          }),
        }
      );

      const data = await response.json();
      if (data.error) return { success: false, error: data.error };

      return { success: true, url: data.url };
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      return { success: false, error: error.message };
    }
  }

  async getCurrentPlan(userId: string): Promise<SubscriptionPlan | undefined> {
    try {
      // First get all available plans
      const plans = await this.getSubscriptionPlans();
      
      // Then get the user's profile to determine their current plan
      const response = await fetch(
        `${this.config.apiUrl}/rest/v1/profiles?user_id=eq.${userId}&select=subscription_plan`,
        {
          headers: {
            "Content-Type": "application/json",
            "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const profiles = await response.json();
      if (!profiles || profiles.length === 0) {
        return undefined;
      }

      const planType = profiles[0].subscription_plan;
      return plans.find(plan => plan.planType === planType);
    } catch (error: any) {
      console.error("Error fetching current plan:", error);
      return undefined;
    }
  }
}

export function createPaymentService(config: PaymentServiceConfig = {}): PaymentProvider {
  return new StripePaymentProvider(config);
}
