import { SubscriptionPlan } from "@/types/subscription";

export interface PaymentResponse {
  success: boolean;
  error?: string;
  url?: string;
  data?: any;
}

export interface SubscriptionStatus {
  isActive: boolean;
  willRenew: boolean;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'unpaid';
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'draft';
  date: Date;
  url?: string;
  pdf?: string;
  number?: string;
  description?: string;
}

export interface PaymentServiceConfig {
  apiUrl?: string;
  successUrl?: string;
  cancelUrl?: string;
  maxRetries?: number;
}

export interface PaymentProvider {
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  createCheckoutSession(accessToken: string, priceId?: string): Promise<PaymentResponse>;
  getCurrentPlan(userId: string): Promise<SubscriptionPlan | undefined>;
  cancelSubscription(userId: string): Promise<PaymentResponse>;
  updateSubscription(userId: string, newPriceId: string): Promise<PaymentResponse>;
  getSubscriptionStatus(userId: string): Promise<SubscriptionStatus>;
  getInvoices(userId: string, limit?: number): Promise<Invoice[]>;
  hasFeatureAccess(userId: string, featureName: string): Promise<boolean>;
}

class StripePaymentProvider implements PaymentProvider {
  private config: PaymentServiceConfig;
  private maxRetries: number;

  constructor(config: PaymentServiceConfig = {}) {
    this.config = {
      apiUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      successUrl: typeof window !== 'undefined' ? `${window.location.origin}/profile?success=true` : '',
      cancelUrl: typeof window !== 'undefined' ? `${window.location.origin}/profile?canceled=true` : '',
      ...config
    };
    this.maxRetries = config.maxRetries || 3;
  }

  private async withRetry<T>(operation: () => Promise<T>, operationName: string): Promise<T> {
    let lastError: any;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        console.warn(`Attempt ${attempt}/${this.maxRetries} failed for ${operationName}: ${error.message}`);
        lastError = error;
        
        if (attempt < this.maxRetries) {
          // Exponential backoff with jitter
          const delay = Math.min(Math.pow(2, attempt) * 100 + Math.random() * 100, 3000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    return this.handleError(lastError, operationName);
  }

  private handleError(error: any, operation: string): never {
    const errorMessage = error.message || `An error occurred during ${operation}`;
    console.error(`Payment service error (${operation}):`, error);
    throw new Error(errorMessage);
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return this.withRetry(async () => {
      const response = await fetch(
        `${this.config.apiUrl}/functions/v1/list-subscription-plans`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}`,
          },
          body: JSON.stringify({}), // Empty body for POST request
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch subscription plans: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.plans || [];
    }, "getSubscriptionPlans");
  }

  async createCheckoutSession(accessToken: string, priceId?: string): Promise<PaymentResponse> {
    return this.withRetry(async () => {
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
    }, "createCheckoutSession");
  }

  async getCurrentPlan(userId: string): Promise<SubscriptionPlan | undefined> {
    return this.withRetry(async () => {
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
    }, "getCurrentPlan");
  }

  async cancelSubscription(userId: string): Promise<PaymentResponse> {
    return this.withRetry(async () => {
      const response = await fetch(
        `${this.config.apiUrl}/functions/v1/cancel-subscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}`,
          },
          body: JSON.stringify({ userId }),
        }
      );

      const data = await response.json();
      if (data.error) return { success: false, error: data.error };

      return { success: true, data: data.subscription };
    }, "cancelSubscription");
  }

  async updateSubscription(userId: string, newPriceId: string): Promise<PaymentResponse> {
    return this.withRetry(async () => {
      const response = await fetch(
        `${this.config.apiUrl}/functions/v1/update-subscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}`,
          },
          body: JSON.stringify({ userId, newPriceId }),
        }
      );

      const data = await response.json();
      if (data.error) return { success: false, error: data.error };

      return { success: true, data: data.subscription };
    }, "updateSubscription");
  }

  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    return this.withRetry(async () => {
      const response = await fetch(
        `${this.config.apiUrl}/functions/v1/subscription-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}`,
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch subscription status");
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // If no subscription, return default status
      if (!data.subscription) {
        return {
          isActive: false,
          willRenew: false,
          status: 'canceled',
        };
      }

      // Convert timestamp to Date object
      const currentPeriodEnd = data.subscription.current_period_end 
        ? new Date(data.subscription.current_period_end * 1000) 
        : undefined;

      return {
        isActive: data.subscription.status === 'active',
        willRenew: data.subscription.status === 'active' && !data.subscription.cancel_at_period_end,
        currentPeriodEnd,
        cancelAtPeriodEnd: data.subscription.cancel_at_period_end,
        status: data.subscription.status,
      };
    }, "getSubscriptionStatus");
  }

  async getInvoices(userId: string, limit: number = 10): Promise<Invoice[]> {
    return this.withRetry(async () => {
      const response = await fetch(
        `${this.config.apiUrl}/functions/v1/list-invoices`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}`,
          },
          body: JSON.stringify({ userId, limit }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch invoices");
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.invoices) {
        return [];
      }

      return data.invoices.map((invoice: any) => ({
        id: invoice.id,
        amount: invoice.amount,
        currency: invoice.currency,
        status: invoice.status,
        date: new Date(invoice.date * 1000),
        url: invoice.url,
        pdf: invoice.pdf,
        number: invoice.number,
        description: invoice.description
      }));
    }, "getInvoices");
  }

  async hasFeatureAccess(userId: string, featureName: string): Promise<boolean> {
    try {
      // Get the current plan
      const currentPlan = await this.getCurrentPlan(userId);
      
      // If no plan found, default to no access
      if (!currentPlan) {
        return false;
      }
      
      // Check if the feature is in the plan's features array
      if (currentPlan.features && currentPlan.features.includes(featureName)) {
        return true;
      }
      
      // For basic features, free tier should have access
      if (featureName === 'basic') {
        return true;
      }
      
      // For premium features, check if user is on premium or higher tier
      if (featureName === 'premium') {
        return currentPlan.planType === 'premium' || currentPlan.planType === 'enterprise';
      }
      
      // For enterprise features, check if user is on enterprise tier
      if (featureName === 'enterprise') {
        return currentPlan.planType === 'enterprise';
      }
      
      return false;
    } catch (error) {
      console.error("Error checking feature access:", error);
      return false;
    }
  }
}

export function createPaymentService(config: PaymentServiceConfig = {}): PaymentProvider {
  return new StripePaymentProvider(config);
}
