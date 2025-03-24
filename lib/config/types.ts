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
  enableAnalytics: boolean;
  enableMarketing: boolean;
  [key: string]: boolean;
}

export interface ThemeConfig {
  colors: {
    primary: { light: string; dark: string };
    secondary: { light: string; dark: string };
    background: { light: string; dark: string };
    text: { light: string; dark: string };
    accent: { light: string; dark: string };
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
