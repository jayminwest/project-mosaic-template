import { SubscriptionPlan } from "@/hooks/useSubscription";

export interface SubscriptionState {
  isLoading: boolean;
  error: string | null;
  plans: SubscriptionPlan[];
}

export interface SubscriptionOperations {
  manageSubscription: (accessToken: string, priceId?: string) => Promise<void>;
}

export type UseSubscriptionReturn = SubscriptionOperations & SubscriptionState;
