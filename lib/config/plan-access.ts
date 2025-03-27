import { subscriptionPlans } from './subscription.ts';
import { productConfig } from './default-config.ts';

// Default resource limits by plan type
const defaultLimits = {
  free: {
    Storage: 10, // MB
    Resources: 10,
    AIInteractions: 20,
    APICalls: 100
  },
  premium: {
    Storage: 50, // MB
    Resources: 100,
    AIInteractions: 100,
    APICalls: 1000
  },
  enterprise: {
    Storage: 500, // MB
    Resources: 1000,
    AIInteractions: 500,
    APICalls: 10000
  }
};

// Default features by plan type
const defaultFeatures = {
  free: ['basic_ai', 'basic_storage', 'basic_analytics'],
  premium: ['basic_ai', 'advanced_ai', 'basic_storage', 'advanced_storage', 'basic_analytics', 'advanced_analytics', 'priority_support'],
  enterprise: ['basic_ai', 'advanced_ai', 'premium_ai', 'basic_storage', 'advanced_storage', 'unlimited_storage', 'basic_analytics', 'advanced_analytics', 'priority_support', 'team_collaboration']
};

// Default grace period in days after cancellation
export const DEFAULT_GRACE_PERIOD_DAYS = 30;

// Check if a user is in the grace period after cancellation
export function isInGracePeriod(cancellationDate?: string | null, gracePeriodDays: number = DEFAULT_GRACE_PERIOD_DAYS): boolean {
  if (!cancellationDate) return false;
  
  const cancelDate = new Date(cancellationDate);
  const now = new Date();
  
  // Calculate the end of grace period
  const graceEndDate = new Date(cancelDate);
  graceEndDate.setDate(graceEndDate.getDate() + gracePeriodDays);
  
  // User is in grace period if current date is before grace period end
  return now <= graceEndDate;
}

// Calculate remaining days in grace period
export function getRemainingGraceDays(cancellationDate?: string | null, gracePeriodDays: number = DEFAULT_GRACE_PERIOD_DAYS): number {
  if (!cancellationDate) return 0;
  
  const cancelDate = new Date(cancellationDate);
  const now = new Date();
  
  // Calculate the end of grace period
  const graceEndDate = new Date(cancelDate);
  graceEndDate.setDate(graceEndDate.getDate() + gracePeriodDays);
  
  // Calculate remaining days
  const remainingTime = graceEndDate.getTime() - now.getTime();
  const remainingDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, remainingDays);
}

// Get formatted grace period end date
export function getGracePeriodEndDate(cancellationDate?: string | null, gracePeriodDays: number = DEFAULT_GRACE_PERIOD_DAYS): string {
  if (!cancellationDate) return '';
  
  const cancelDate = new Date(cancellationDate);
  const graceEndDate = new Date(cancelDate);
  graceEndDate.setDate(graceEndDate.getDate() + gracePeriodDays);
  
  return graceEndDate.toLocaleDateString();
}

// Get resource limit for a specific plan type
export function getResourceLimit(planType: string, resourceName: string): number {
  // Default to free plan if the plan type is invalid
  const plan = planType && ['free', 'premium', 'enterprise'].includes(planType) ? planType : 'free';
  
  // First check if the limit is defined in the subscription plans from Stripe
  const planFromStripe = subscriptionPlans.find(p => p.planType === plan);
  if (planFromStripe?.limits && planFromStripe.limits[resourceName]) {
    return planFromStripe.limits[resourceName];
  }
  
  // Check if the limit is defined in the product config
  if (productConfig.limits && 
      productConfig.limits[plan as keyof typeof productConfig.limits] && 
      resourceName in productConfig.limits[plan as keyof typeof productConfig.limits]) {
    return productConfig.limits[plan as keyof typeof productConfig.limits][resourceName as keyof typeof productConfig.limits.free];
  }
  
  // Fallback to default limits
  return defaultLimits[plan as keyof typeof defaultLimits][resourceName as keyof typeof defaultLimits.free] || 0;
}

// Check if a feature is available in a plan
export function hasFeatureAccess(
  planType: string, 
  featureName: string, 
  cancellationDate?: string | null, 
  gracePeriodDays: number = DEFAULT_GRACE_PERIOD_DAYS
): boolean {
  // If user is in grace period and was previously on premium/enterprise plan,
  // they should still have access to premium features
  if (
    cancellationDate && 
    isInGracePeriod(cancellationDate, gracePeriodDays) && 
    (planType === 'premium' || planType === 'enterprise')
  ) {
    return true;
  }
  
  // Default to free plan if the plan type is invalid
  const plan = planType && ['free', 'premium', 'enterprise'].includes(planType) ? planType : 'free';
  
  // First check if the feature is defined in the subscription plans from Stripe
  const planFromStripe = subscriptionPlans.find(p => p.planType === plan);
  if (planFromStripe?.features) {
    // Check if the feature is directly included in the plan's features array
    if (planFromStripe.features.includes(featureName)) {
      return true;
    }
    
    // Check if the feature is included in any feature description
    for (const feature of planFromStripe.features) {
      if (feature.toLowerCase().includes(featureName.toLowerCase())) {
        return true;
      }
    }
  }
  
  // Fallback to default features
  return defaultFeatures[plan as keyof typeof defaultFeatures].includes(featureName);
}

// Get all features available for a plan
export function getPlanFeatures(planType: string): string[] {
  // Default to free plan if the plan type is invalid
  const plan = planType && ['free', 'premium', 'enterprise'].includes(planType) ? planType : 'free';
  
  // First check if features are defined in the subscription plans from Stripe
  const planFromStripe = subscriptionPlans.find(p => p.planType === plan);
  if (planFromStripe?.features && planFromStripe.features.length > 0) {
    return planFromStripe.features;
  }
  
  // Fallback to default features
  return defaultFeatures[plan as keyof typeof defaultFeatures];
}
