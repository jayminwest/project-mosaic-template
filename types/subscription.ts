import { SubscriptionStatus, Invoice, PaymentResponse } from "@/lib/payment/payment-service";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceId: string;
  price: number;
  currency: string;
  interval: string;
  planType: 'free' | 'premium' | 'enterprise';
  features: string[];
  limits?: {
    [key: string]: number;
  };
}

export interface SubscriptionState {
  isLoading: boolean;
  error: string | null;
  plans: SubscriptionPlan[];
  currentPlan?: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus | null;
}

export interface SubscriptionStatus {
  active: boolean;
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  planType: string;
  planName: string;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  trialEnd: number | null;
  isTrialing: boolean;
  priceId: string;
  interval: string;
  currency: string;
  amount: number;
}

export interface SubscriptionOperations {
  manageSubscription: (accessToken: string, priceId?: string) => Promise<void>;
  getCurrentPlan: () => Promise<SubscriptionPlan | undefined>;
  cancelSubscription: () => Promise<PaymentResponse | undefined>;
  updateSubscription: (newPriceId: string) => Promise<PaymentResponse | undefined>;
  getInvoices: (limit?: number) => Promise<Invoice[]>;
  hasFeatureAccess: (featureName: string) => Promise<boolean>;
  clearError: () => void;
  
  // Status helpers
  isSubscriptionActive: () => boolean;
  willSubscriptionRenew: () => boolean;
  getSubscriptionEndDate: () => Date | undefined;
  isPremiumTier: () => boolean;
}

export type UseSubscriptionReturn = SubscriptionOperations & SubscriptionState;
