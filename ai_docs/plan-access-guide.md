# Plan Access Guide

This guide explains how to use the plan access system in Project Mosaic to control feature access based on subscription plans.

## Overview

The plan access system provides a way to:

1. Control access to features based on subscription plans
2. Enforce resource limits based on plan tiers
3. Handle grace periods after subscription cancellation
4. Provide visual indicators for premium features

## Core Concepts

### Resource Limits

Each subscription plan has specific resource limits:

```typescript
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
```

### Feature Access

Features are enabled or disabled based on the user's subscription plan:

```typescript
// Default features by plan type
const defaultFeatures = {
  free: ['basic_ai', 'basic_storage', 'basic_analytics'],
  premium: ['basic_ai', 'advanced_ai', 'basic_storage', 'advanced_storage', 'basic_analytics', 'advanced_analytics', 'priority_support'],
  enterprise: ['basic_ai', 'advanced_ai', 'premium_ai', 'basic_storage', 'advanced_storage', 'unlimited_storage', 'basic_analytics', 'advanced_analytics', 'priority_support', 'team_collaboration']
};
```

### Grace Period

When a user cancels their subscription, they retain access to premium features until the end of their billing period. This is called the grace period.

## Using the Plan Access System

### Checking Feature Access

```typescript
import { hasFeatureAccess } from '@/lib/config/plan-access';

// Check if a user has access to a feature
const canAccessAdvancedAI = hasFeatureAccess(
  user.subscription_plan || 'free', // Default to free if no plan
  'advanced_ai',
  user.cancellation_date // Optional, for grace period handling
);

// Use in conditional rendering
if (canAccessAdvancedAI) {
  // Show advanced AI features
} else {
  // Show upgrade prompt
}
```

### Getting Resource Limits

```typescript
import { getResourceLimit } from '@/lib/config/plan-access';

// Get the AI interaction limit for the user's plan
const aiLimit = getResourceLimit(
  user.subscription_plan || 'free',
  'AIInteractions'
);

// Compare with current usage
const currentUsage = user.usage_metrics?.ai_interactions_count || 0;
const remainingUsage = Math.max(0, aiLimit - currentUsage);

// Check if user has reached their limit
const hasReachedLimit = currentUsage >= aiLimit;
```

### Handling Grace Periods

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

// Use in UI
if (inGracePeriod) {
  return (
    <div className="alert">
      Your subscription has been cancelled. 
      You will have access to premium features until {endDate} 
      ({remainingDays} days remaining).
    </div>
  );
}
```

## Integration with UI Components

### Feature Limit Component

The `FeatureLimit` component visualizes resource usage and limits:

```tsx
<FeatureLimit
  title="AI Usage"
  description="Monthly AI interactions"
  current={metrics?.ai_interactions_count || 0}
  limit={getResourceLimit(user?.subscription_plan || 'free', 'AIInteractions')}
  unit="interactions"
  showUpgradeLink={user?.subscription_plan === 'free'}
/>
```

### Premium Badge

The `PremiumBadge` component indicates premium features:

```tsx
<div className="flex items-center">
  Advanced Analytics
  <PremiumBadge type="premium" className="ml-2" />
</div>
```

### Upgrade Prompt

The `UpgradePrompt` component encourages users to upgrade:

```tsx
<UpgradePrompt
  feature="Advanced AI"
  description="Upgrade to Premium to access advanced AI features"
/>
```

## Using the useFeatureAccess Hook

For React components, you can use the `useFeatureAccess` hook:

```tsx
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

function PremiumFeature() {
  const { hasAccess, isLoading } = useFeatureAccess('advancedAI');
  
  if (isLoading) return <LoadingSkeleton />;
  
  return (
    <div>
      {hasAccess ? (
        <AdvancedFeature />
      ) : (
        <UpgradePrompt feature="Advanced AI" />
      )}
    </div>
  );
}
```

## Customizing Plan Access

### Adding Custom Resource Limits

You can define custom resource limits in your product configuration:

```typescript
// In lib/config/default-config.ts
export const productConfig: ProductConfig = {
  // ...other config
  limits: {
    free: {
      resourceLimit: 10,
      storageLimit: 5, // MB
      customLimit: 20, // Your custom limit
    },
    premium: {
      resourceLimit: 100,
      storageLimit: 50, // MB
      customLimit: 200, // Your custom limit
    }
  },
  // ...other config
};
```

### Adding Custom Features

You can define custom features in your feature flags:

```typescript
// In lib/config/features.ts
export const featureFlags: FeatureFlags = {
  enableAI: true,
  enableStorage: true,
  enableSharing: false,
  enableAnalytics: true,
  enableMarketing: true,
  enableDirectSubscription: true,
  enableYourCustomFeature: true, // Your custom feature
};
```

## Best Practices

1. **Default to Free Plan**: Always default to the free plan when checking access if the user's plan is undefined
2. **Handle Loading States**: Show loading skeletons while checking feature access
3. **Graceful Degradation**: Provide useful alternatives when users don't have access to premium features
4. **Clear Upgrade Paths**: Make it obvious how users can upgrade to access premium features
5. **Respect Grace Periods**: Allow users to continue using premium features during their grace period
6. **Track Usage**: Monitor resource usage to prevent abuse and ensure fair usage
7. **Provide Feedback**: Clearly communicate when users are approaching or have reached their limits
