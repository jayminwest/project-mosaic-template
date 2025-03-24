/**
 * Quick Setup Configuration
 * 
 * This file allows for rapid configuration of the entire application from a single file.
 * It's designed to be easily modified by LLMs or developers who want to quickly set up
 * the project without going through the interactive setup process.
 * 
 * To use:
 * 1. Modify this file with your desired configuration
 * 2. Run: npm run quick-setup
 */

import { ProductConfig, ThemeConfig, SubscriptionPlan, FeatureFlags } from './types';

/**
 * Product Configuration
 */
export const quickProductConfig: ProductConfig = {
  name: "Your Product Name",
  description: "A brief description of your product",
  slug: "your-product", // Used in URLs and as prefix for storage
  limits: {
    free: {
      resourceLimit: 10,
      storageLimit: 5, // MB
    },
    premium: {
      resourceLimit: 100,
      storageLimit: 50, // MB
    }
  },
  features: {
    enableAI: true,
    enableStorage: true,
    enableSharing: false,
  }
};

/**
 * Theme Configuration
 */
export const quickThemeConfig: ThemeConfig = {
  colors: {
    primary: {
      light: "#4f46e5", // Indigo
      dark: "#818cf8",
    },
    secondary: {
      light: "#0ea5e9", // Sky
      dark: "#38bdf8",
    },
    background: {
      light: "#ffffff",
      dark: "#1e293b",
    },
    text: {
      light: "#334155",
      dark: "#e2e8f0",
    },
    accent: {
      light: "#f97316", // Orange
      dark: "#fb923c",
    },
  },
  fonts: {
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif",
  },
  borderRadius: "0.5rem",
};

/**
 * Feature Flags
 */
export const quickFeatureFlags: FeatureFlags = {
  enableAI: true,
  enableStorage: true,
  enableSharing: false,
  enableAnalytics: true,
  enableMarketing: true,
};

/**
 * Subscription Plans
 */
export const quickSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Basic features for personal use",
    priceId: "", // No price ID for free plan
    price: 0,
    currency: "USD",
    interval: "month",
    planType: "free",
    features: [
      "Up to 10 resources",
      "5MB storage",
      "Basic features"
    ]
  },
  {
    id: "premium",
    name: "Premium",
    description: "Advanced features for professionals",
    priceId: "", // Will be populated by setup script
    price: 9.99,
    currency: "USD",
    interval: "month",
    planType: "premium",
    features: [
      "Up to 100 resources",
      "50MB storage",
      "Advanced features",
      "Priority support"
    ]
  }
];

/**
 * Stripe Configuration
 * These settings will be used to create Stripe products and prices
 */
export const quickStripeConfig = {
  createProducts: true, // Set to false to skip Stripe product creation
  premium: {
    productName: "Premium Plan",
    productDescription: "Advanced features for professionals",
    price: 9.99,
    currency: "USD",
    interval: "month",
  }
};

/**
 * Email Configuration
 */
export const quickEmailConfig = {
  fromEmail: "noreply@yourdomain.com",
  fromName: "Your Product Name",
  setupSupabaseSmtp: true, // Set to false to skip Supabase SMTP setup
};
