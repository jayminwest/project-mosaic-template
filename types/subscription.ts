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
}

export interface SubscriptionOperations {
  manageSubscription: (accessToken: string, priceId?: string) => Promise<void>;
  getCurrentPlan: () => Promise<SubscriptionPlan | undefined>;
}

export type UseSubscriptionReturn = SubscriptionOperations & SubscriptionState;
