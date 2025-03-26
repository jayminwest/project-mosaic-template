// Define features available in each plan
export const planFeatures = {
  free: {
    maxStorage: 10, // MB
    maxResources: 10,
    maxAIInteractions: 20,
    maxAPICalls: 100,
    features: ['basic_ai', 'basic_storage', 'basic_analytics']
  },
  premium: {
    maxStorage: 50, // MB
    maxResources: 100,
    maxAIInteractions: 100,
    maxAPICalls: 1000,
    features: ['advanced_ai', 'advanced_storage', 'advanced_analytics', 'priority_support']
  },
  enterprise: {
    maxStorage: 500, // MB
    maxResources: 1000,
    maxAIInteractions: 500,
    maxAPICalls: 10000,
    features: ['premium_ai', 'unlimited_storage', 'advanced_analytics', 'priority_support', 'team_collaboration']
  }
};
