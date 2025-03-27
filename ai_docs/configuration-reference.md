# Configuration Reference

This document provides a comprehensive reference for the configuration system in Project Mosaic.

## Overview

Project Mosaic uses a centralized configuration system to manage product settings, theme customization, subscription plans, and feature flags. This allows for easy customization of the template for different product types.

## Configuration Structure

The configuration system is organized into several modules:

```
/lib/config/
├── types.ts           # TypeScript interfaces for configuration
├── index.ts           # Main exports and helper functions
├── default-config.ts  # Product-specific settings
├── theme.ts           # Theme customization
├── subscription.ts    # Subscription plan definitions
├── features.ts        # Feature flags
├── environment.ts     # Environment variable validation
├── plan-access.ts     # Feature access based on subscription plans
├── service-config.ts  # Service configuration
└── useConfig.ts       # React hook for accessing configuration
```

## Core Types

### ProductConfig

Defines the core product configuration:

```typescript
interface ProductConfig {
  name: string;
  description: string;
  slug: string;
  limits: {
    free: ResourceLimits;
    premium: ResourceLimits;
  };
  features: FeatureFlags;
  routes?: {
    public: string[];
    authenticated: string;
  };
  storage?: {
    bucketName: string;
  };
}
```

### ResourceLimits

Defines resource limits for different subscription tiers:

```typescript
interface ResourceLimits {
  resourceLimit: number;
  storageLimit: number; // in MB
  [key: string]: number; // Additional custom limits
}
```

### FeatureFlags

Defines which features are enabled:

```typescript
interface FeatureFlags {
  enableAI: boolean;
  enableStorage: boolean;
  enableSharing: boolean;
  enableAnalytics: boolean;
  enableMarketing: boolean;
  [key: string]: boolean; // Additional custom feature flags
}
```

### ThemeConfig

Defines theme customization options:

```typescript
interface ThemeConfig {
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
```

### SubscriptionPlan

Defines subscription plan details:

```typescript
interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceId: string;
  price: number;
  currency: string;
  interval: string;
  planType: 'free' | 'premium' | 'enterprise';
  features: string[];
  limits?: Record<string, number>;
  buttonText?: string;
  buttonLink?: string;
  buttonVariant?: string;
  highlighted?: boolean;
}
```

## Default Configuration

### Product Configuration

The default product configuration is defined in `lib/config/default-config.ts`:

```typescript
export const productConfig: ProductConfig = {
  name: "Project Mosaic",
  description: "A flexible micro-SaaS template for rapid development",
  slug: "project-mosaic", // Used in URLs and as prefix for storage
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
    enableAnalytics: false,
    enableMarketing: true
  },
  routes: {
    public: ["/", "/login", "/pricing", "/about", "/contact"],
    authenticated: "/dashboard"
  },
  storage: {
    bucketName: "app-storage"
  }
};
```

### Feature Flags

Feature flags are defined in `lib/config/features.ts`:

```typescript
export const featureFlags: FeatureFlags = {
  enableAI: true,
  enableStorage: true,
  enableSharing: false,
  enableAnalytics: true,
  enableMarketing: true,
  enableDirectSubscription: true, // Enable direct subscription via URL parameters
};
```

## Environment Variables

The environment validation system checks for required and optional environment variables:

```typescript
// Required environment variables
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
];

// Optional environment variables
const optionalVars = [
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'RESEND_API_KEY',
  'EMAIL_FROM',
];

// Feature-specific variables
const featureSpecificVars = {
  enableAI: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'],
  enableEmail: ['RESEND_API_KEY', 'EMAIL_FROM'],
};
```

## Plan Access System

The plan access system controls feature access based on subscription plans:

### Default Resource Limits

```typescript
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
```

### Default Features by Plan

```typescript
const defaultFeatures = {
  free: ['basic_ai', 'basic_storage', 'basic_analytics'],
  premium: ['basic_ai', 'advanced_ai', 'basic_storage', 'advanced_storage', 'basic_analytics', 'advanced_analytics', 'priority_support'],
  enterprise: ['basic_ai', 'advanced_ai', 'premium_ai', 'basic_storage', 'advanced_storage', 'unlimited_storage', 'basic_analytics', 'advanced_analytics', 'priority_support', 'team_collaboration']
};
```

## Using the Configuration System

### useConfig Hook

The `useConfig` hook provides access to the configuration system in React components:

```typescript
import { useConfig } from '@/lib/config/useConfig';

function MyComponent() {
  const { 
    product, 
    theme, 
    subscriptionPlans,
    getSubscriptionPlan,
    isFeatureEnabled,
    getResourceLimit,
    hasFeatureAccess,
    getPlanFeatures
  } = useConfig();
  
  // Access product configuration
  const productName = product.name;
  
  // Access theme configuration
  const primaryColor = theme.colors.primary.light;
  
  // Check if a feature is enabled
  const aiEnabled = isFeatureEnabled('enableAI');
  
  // Get a subscription plan by ID
  const premiumPlan = getSubscriptionPlan('premium');
  
  // Check resource limits
  const storageLimit = getResourceLimit('premium', 'Storage');
  
  // Check feature access
  const hasAdvancedAI = hasFeatureAccess('premium', 'advanced_ai');
  
  // Get all features for a plan
  const premiumFeatures = getPlanFeatures('premium');
  
  return (
    <div>
      <h1>{productName}</h1>
      {/* Use configuration values in your component */}
    </div>
  );
}
```

### Direct Import

You can also import configuration values directly:

```typescript
import { productConfig, themeConfig, subscriptionPlans, featureFlags } from '@/lib/config';

// Access product configuration
const productName = productConfig.name;

// Access theme configuration
const primaryColor = themeConfig.colors.primary.light;

// Access subscription plans
const premiumPlan = subscriptionPlans.find(plan => plan.id === 'premium');

// Check feature flags
const aiEnabled = featureFlags.enableAI;
```

## Plan Access Helpers

### getResourceLimit

Gets the resource limit for a specific plan type and resource:

```typescript
import { getResourceLimit } from '@/lib/config/plan-access';

// Get the AI interaction limit for the premium plan
const aiLimit = getResourceLimit('premium', 'AIInteractions');
```

### hasFeatureAccess

Checks if a feature is available in a plan:

```typescript
import { hasFeatureAccess } from '@/lib/config/plan-access';

// Check if the premium plan has access to advanced AI
const hasAdvancedAI = hasFeatureAccess('premium', 'advanced_ai');

// Check with grace period handling
const stillHasAccess = hasFeatureAccess(
  'premium', 
  'advanced_ai',
  user.cancellation_date
);
```

### Grace Period Helpers

```typescript
import { 
  isInGracePeriod, 
  getRemainingGraceDays,
  getGracePeriodEndDate 
} from '@/lib/config/plan-access';

// Check if user is in grace period
const inGracePeriod = isInGracePeriod(user.cancellation_date);

// Get remaining days in grace period
const remainingDays = getRemainingGraceDays(user.cancellation_date);

// Get formatted end date
const endDate = getGracePeriodEndDate(user.cancellation_date);
```

## Environment Validation

The environment validation system checks for required and optional environment variables:

```typescript
import { validateEnvironment } from '@/lib/config/environment';

// Check environment variables
const { valid, missingRequired, missingOptional } = validateEnvironment();

if (!valid) {
  console.warn(`Missing required environment variables: ${missingRequired.join(', ')}`);
}

if (missingOptional.length > 0) {
  console.info(`Missing optional environment variables: ${missingOptional.join(', ')}`);
}
```

## Customizing Configuration

### Quick Setup

The quickest way to customize the configuration is to use the quick setup script:

1. Modify `lib/config/quick-setup.ts` with your product details:
   ```typescript
   export default {
     product: {
       name: "Your Product Name",
       description: "Your product description",
       slug: "your-product-slug",
     },
     limits: {
       free: {
         resourceLimit: 10,
         storageLimit: 5,
       },
       premium: {
         resourceLimit: 100,
         storageLimit: 50,
       }
     },
     features: {
       enableAI: true,
       enableStorage: true,
       enableSharing: false,
       enableAnalytics: true,
       enableMarketing: true,
     }
   };
   ```

2. Run the quick setup script:
   ```bash
   npm run quick-setup
   ```

### Interactive Setup

For a more guided approach, use the interactive setup script:

```bash
npm run init-config
```

This will prompt you for various configuration options and update the configuration files accordingly.

### Manual Configuration

To manually customize the configuration:

1. Update `lib/config/default-config.ts` with your product details.
2. Modify `lib/config/features.ts` to enable or disable features.
3. Update `lib/config/theme.ts` with your brand colors and typography.
4. Modify `lib/config/subscription.ts` with your subscription plans.

## Best Practices

1. **Use Environment Variables for Sensitive Data**: Never hardcode API keys or secrets in configuration files.

2. **Validate Environment Variables**: Always check that required environment variables are set before using them.

3. **Use Feature Flags for Experimental Features**: Enable or disable features using feature flags rather than commenting out code.

4. **Keep Configuration DRY**: Don't repeat configuration values across multiple files.

5. **Use Type Safety**: Leverage TypeScript interfaces to ensure configuration objects have the correct structure.

6. **Document Configuration Options**: Add comments to explain the purpose and valid values for configuration options.

7. **Test Configuration Changes**: Verify that your application works correctly after changing configuration values.

8. **Use Sensible Defaults**: Provide reasonable default values for all configuration options.

9. **Centralize Access**: Use the `useConfig` hook to access configuration values in React components.

10. **Separate Environment-Specific Configuration**: Use different configuration values for development, testing, and production environments.
