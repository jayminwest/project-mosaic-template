import { productConfig } from './default-config.js';
import { themeConfig } from './theme.js';
import { subscriptionPlans } from './subscription.js';
import { featureFlags } from './features.js';
import { validateEnvironment } from './environment.js';

// Validate environment variables on startup
validateEnvironment();

export {
  productConfig,
  themeConfig,
  subscriptionPlans,
  featureFlags,
};

// Helper function to check if a feature is enabled
export function isFeatureEnabled(featureName: keyof typeof featureFlags): boolean {
  return featureFlags[featureName] === true;
}

// Helper function to get resource limits based on plan type
export function getResourceLimits(planType: 'free' | 'premium'): typeof productConfig.limits.free {
  return productConfig.limits[planType];
}
