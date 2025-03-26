"use client";

import { useConfig } from '@/lib/config/useConfig';
import { useSubscription } from './useSubscription';

export function useFeatureAccess() {
  const { hasFeatureAccess, getResourceLimit } = useConfig();
  const { currentPlan, isPremiumTier } = useSubscription();
  
  // Get the plan type from subscription only, not from user
  const planType = currentPlan?.planType || 'free';
  
  const canAccessFeature = (featureName: string): boolean => {
    // Make sure we're using the correct plan type
    const actualPlanType = currentPlan?.planType || planType;
    return hasFeatureAccess(actualPlanType, featureName);
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
