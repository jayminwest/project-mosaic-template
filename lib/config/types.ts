/**
 * Configuration system type definitions
 */

export interface ProductConfig {
  name: string;
  description: string;
  slug: string;
  limits: {
    free: ResourceLimits;
    premium: ResourceLimits;
  };
  features: FeatureFlags;
}

export interface ResourceLimits {
  resourceLimit: number;
  storageLimit: number; // in MB
}

export interface FeatureFlags {
  enableAI: boolean;
  enableStorage: boolean;
  enableSharing: boolean;
  [key: string]: boolean;
}

export interface ThemeConfig {
  colors: {
    primary: { light: string; dark: string };
    secondary: { light: string; dark: string };
    // Other color variables
  };
  fonts: {
    heading: string;
    body: string;
  };
  borderRadius: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceId: string;
  price: number;
  currency: string;
  interval: string;
  planType: 'free' | 'premium' | 'enterprise';
  features: string[];
}
