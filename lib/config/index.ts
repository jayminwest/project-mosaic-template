import { productConfig } from './default-config';
import { themeConfig } from './theme';
import { subscriptionPlans } from './subscription';
import { featureFlags } from './features';
import { validateEnvironment } from './environment';

// Validate environment variables on startup
validateEnvironment();

export {
  productConfig,
  themeConfig,
  subscriptionPlans,
  featureFlags,
  validateEnvironment,
};

export { useConfig } from './useConfig';

// Helper function to check if a feature is enabled
export function isFeatureEnabled(featureName: keyof typeof featureFlags): boolean {
  return featureFlags[featureName] === true;
}

// Helper function to get resource limits based on plan type
export function getResourceLimits(planType: 'free' | 'premium'): typeof productConfig.limits.free {
  return productConfig.limits[planType];
}
