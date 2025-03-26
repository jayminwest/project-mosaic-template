import { subscriptionPlans } from './subscription';

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

// Get resource limit for a specific plan type
export function getResourceLimit(planType: string, resourceName: string): number {
  // Default to free plan if the plan type is invalid
  const plan = planType && ['free', 'premium', 'enterprise'].includes(planType) ? planType : 'free';
  
  // First check if the limit is defined in the subscription plans from Stripe
  const planFromStripe = subscriptionPlans.find(p => p.planType === plan);
  if (planFromStripe?.limits && planFromStripe.limits[resourceName]) {
    return planFromStripe.limits[resourceName];
  }
  
  // Fallback to default limits
  return defaultLimits[plan as keyof typeof defaultLimits][resourceName as keyof typeof defaultLimits.free] || 0;
}

// Check if a feature is available in a plan
export function hasFeatureAccess(planType: string, featureName: string): boolean {
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
