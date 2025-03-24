# Configuration System

The Project Mosaic template includes a comprehensive configuration system that allows you to easily customize your micro-SaaS product without modifying core code. This tutorial will guide you through using and customizing the configuration system.

## Overview

The configuration system is located in the `lib/config/` directory and consists of several key files:

```
/lib/config/
├── types.ts           # TypeScript interfaces for configuration
├── index.ts           # Main exports and helper functions
├── default-config.ts  # Product-specific settings
├── theme.ts           # Theme customization
├── subscription.ts    # Subscription plan definitions
├── features.ts        # Feature flags
├── environment.ts     # Environment variable validation
├── useConfig.ts       # React hook for accessing configuration
└── quick-setup.ts     # Single-file configuration for quick setup
```

## Setup Scripts

The template includes two scripts for configuring your product:

1. **Interactive Setup**: Guides you through the configuration process with prompts
   ```bash
   npm run init-config
   ```

2. **Quick Setup**: Uses predefined configuration from a single file
   ```bash
   npm run quick-setup
   ```

## Core Configuration Files

### Product Configuration

The `default-config.ts` file contains your product's core settings:

```typescript
export const productConfig: ProductConfig = {
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
```

### Theme Configuration

The `theme.ts` file controls your product's visual appearance:

```typescript
export const themeConfig: ThemeConfig = {
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
```

### Subscription Plans

The `subscription.ts` file defines your product's pricing tiers:

```typescript
export const subscriptionPlans: SubscriptionPlan[] = [
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
    priceId: "price_1234567890", // Will be updated by setup script
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
```

### Feature Flags

The `features.ts` file controls which features are enabled:

```typescript
import { FeatureFlags } from './types';

export const featureFlags: FeatureFlags = {
  enableAI: true,
  enableStorage: true,
  enableSharing: false,
  enableAnalytics: true,
  enableMarketing: true,
};
```

## Using the Configuration in Components

The `useConfig` hook provides access to all configuration in your React components:

```typescript
import { useConfig } from '@/lib/config/useConfig';

export function PricingComponent() {
  const { product, subscriptionPlans, isFeatureEnabled } = useConfig();
  
  return (
    <div>
      <h1>{product.name} Pricing</h1>
      {subscriptionPlans.map(plan => (
        <div key={plan.id}>
          <h2>{plan.name}</h2>
          <p>{plan.description}</p>
          <p>${plan.price}/{plan.interval}</p>
          <ul>
            {plan.features.map(feature => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
          {plan.planType !== 'free' && (
            <button>Subscribe</button>
          )}
        </div>
      ))}
      
      {isFeatureEnabled('enableAI') && (
        <div>AI-powered features available!</div>
      )}
    </div>
  );
}
```

## Helper Functions

The configuration system includes several helper functions:

### Check if a Feature is Enabled

```typescript
import { isFeatureEnabled } from '@/lib/config';

if (isFeatureEnabled('enableAI')) {
  // Use AI features
}
```

### Get Resource Limits Based on Plan Type

```typescript
import { getResourceLimits } from '@/lib/config';

const limits = getResourceLimits('premium');
console.log(`Resource limit: ${limits.resourceLimit}`);
console.log(`Storage limit: ${limits.storageLimit} MB`);
```

## Environment Variable Validation

The `environment.ts` file validates required and optional environment variables:

```typescript
export function validateEnvironment(): { 
  valid: boolean; 
  missingRequired: string[]; 
  missingOptional: string[]; 
} {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ];

  const optionalVars = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'RESEND_API_KEY',
    'EMAIL_FROM',
  ];

  const featureSpecificVars = {
    enableAI: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'],
    enableEmail: ['RESEND_API_KEY', 'EMAIL_FROM'],
  };

  // Validation logic...
  
  return {
    valid: missingRequired.length === 0,
    missingRequired,
    missingOptional,
  };
}
```

This function is automatically called when the application starts, warning you about any missing environment variables. It also returns an object with validation results that can be used programmatically.

## Quick Setup Configuration

For rapid configuration, you can modify the `quick-setup.ts` file:

```typescript
export const quickProductConfig: ProductConfig = {
  name: "Your Product Name",
  description: "A brief description of your product",
  slug: "your-product",
  // Other settings...
};

export const quickThemeConfig: ThemeConfig = {
  // Theme settings...
};

export const quickFeatureFlags: FeatureFlags = {
  // Feature flags...
};

export const quickSubscriptionPlans: SubscriptionPlan[] = [
  // Subscription plans...
];

export const quickStripeConfig = {
  // Stripe configuration...
};

export const quickEmailConfig = {
  // Email configuration...
};
```

After modifying this file, run:

```bash
npm run quick-setup
```

This will generate all the necessary configuration files and set up Stripe products and prices if configured.

## Stripe Integration

The configuration system integrates with Stripe to create products and prices for your subscription plans. When you run the setup scripts, they will:

1. Check if you have a Stripe API key configured
2. Create products in Stripe based on your subscription plans
3. Create prices for each product
4. Update your subscription plans with the correct price IDs

This ensures that your subscription system is ready to use immediately after setup.

## Best Practices

1. **Keep Configuration Centralized**
   - Use the config files for all customizable values
   - Avoid hardcoding product-specific values in components

2. **Use Feature Flags for Conditional Features**
   - Wrap experimental or tier-specific features in feature flags
   - This makes it easy to enable/disable features without code changes

3. **Leverage the useConfig Hook**
   - Use the hook to access configuration in components
   - This ensures consistent access to the latest configuration

4. **Run Setup Scripts After Changes**
   - If you manually modify configuration files, run the setup scripts
   - This ensures Stripe products and prices stay in sync

5. **Version Control Your Configuration**
   - Commit your configuration files to version control
   - This provides a history of configuration changes

## Next Steps

Now that you understand the configuration system, you can:

1. Run `npm run init-config` to set up your product
2. Customize the theme to match your branding
3. Define your subscription plans and pricing
4. Enable/disable features based on your product requirements
5. Use the `useConfig` hook in your components

The configuration system provides a solid foundation for customizing your micro-SaaS product while maintaining a clean separation between configuration and code.
