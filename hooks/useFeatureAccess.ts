"use client";

import { useConfig } from '@/lib/config/useConfig';
import { useAuth } from './useAuth';
import { useSubscription } from './useSubscription';

export function useFeatureAccess() {
  const { hasFeatureAccess, getResourceLimit } = useConfig();
  const { user } = useAuth();
  const { currentPlan, isPremiumTier } = useSubscription();
  
  const planType = currentPlan?.planType || user?.subscription_plan || 'free';
  
  const canAccessFeature = (featureName: string): boolean => {
    return hasFeatureAccess(planType, featureName);
  };
  
  const getLimit = (resourceName: string): number => {
    return getResourceLimit(planType, resourceName);
  };
  
  const isAtLimit = (resourceName: string, currentUsage: number): boolean => {
    const limit = getLimit(resourceName);
    return currentUsage >= limit;
  };
  
  const isNearLimit = (resourceName: string, currentUsage: number, threshold = 0.8): boolean => {
    const limit = getLimit(resourceName);
    return currentUsage >= limit * threshold;
  };
  
  return {
    canAccessFeature,
    getLimit,
    isAtLimit,
    isNearLimit,
    isPremium: isPremiumTier(),
    planType
  };
}
