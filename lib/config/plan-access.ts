import { planFeatures } from './plan-features';

// Get resource limit for a specific plan type
export function getResourceLimit(planType: string, resourceName: string): number {
  const plan = planType && planFeatures[planType as keyof typeof planFeatures] ? planType : 'free';
  const limitKey = `max${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}` as keyof typeof planFeatures.free;
  return planFeatures[plan as keyof typeof planFeatures][limitKey] || planFeatures.free[limitKey];
}

// Check if a feature is available in a plan
export function hasFeatureAccess(planType: string, featureName: string): boolean {
  // Default to free plan if the plan type is invalid
  const plan = planType && planFeatures[planType as keyof typeof planFeatures] ? planType : 'free';
  
  // Get the features for this plan
  const features = planFeatures[plan as keyof typeof planFeatures].features;
  
  // Check if the feature is included in the plan's features
  return features.includes(featureName);
}

// Get all features available for a plan
export function getPlanFeatures(planType: string): string[] {
  const plan = planType && planFeatures[planType as keyof typeof planFeatures] ? planType : 'free';
  return planFeatures[plan as keyof typeof planFeatures].features || [];
}
