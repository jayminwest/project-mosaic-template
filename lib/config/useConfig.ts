import { useCallback } from 'react';
import { productConfig, themeConfig, subscriptionPlans, featureFlags } from './index';
import { SubscriptionPlan } from './types';

export function useConfig() {
  const getSubscriptionPlan = useCallback((planId: string): SubscriptionPlan | undefined => {
    return subscriptionPlans.find(plan => plan.id === planId);
  }, []);

  const isFeatureEnabled = useCallback((featureName: keyof typeof featureFlags): boolean => {
    return featureFlags[featureName] === true;
  }, []);

  return {
    product: productConfig,
    theme: themeConfig,
    subscriptionPlans,
    getSubscriptionPlan,
    isFeatureEnabled,
  };
}
