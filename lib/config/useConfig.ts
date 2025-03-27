import { productConfig, themeConfig, subscriptionPlans, featureFlags } from './index';
import { SubscriptionPlan } from './types';
import { getResourceLimit, hasFeatureAccess, getPlanFeatures } from './plan-access';

export function useConfig() {
  // Return a static object without hooks to avoid hook ordering issues
  return {
    product: productConfig,
    theme: themeConfig,
    subscriptionPlans,
    getSubscriptionPlan: (planId: string): SubscriptionPlan | undefined => {
      return subscriptionPlans.find(plan => plan.id === planId);
    },
    isFeatureEnabled: (featureName: keyof typeof featureFlags): boolean => {
      return featureFlags[featureName] === true;
    },
    getResourceLimit,
    hasFeatureAccess,
    getPlanFeatures,
  };
}
