# A/B Testing Guide

This guide explains how to use the A/B testing system in Project Mosaic to optimize your SaaS product.

## Overview

The A/B testing system allows you to create experiments with different variants of your UI or functionality and measure which performs better. This helps you make data-driven decisions about your product.

## Core Concepts

- **Test**: An experiment that compares different variants of a feature
- **Variant**: A specific version of a feature being tested
- **Impression**: When a user sees a variant
- **Conversion**: When a user completes the desired action
- **Conversion Rate**: The percentage of impressions that result in conversions

## Architecture

The A/B testing system follows the same provider-agnostic pattern as other services in Project Mosaic:

```
┌─────────────────────────────────────────────────────────────┐
│                   ABTestingService Class                    │
├─────────────────────────────────────────────────────────────┤
│                    Provider Interface                       │
├─────────────────────────────────────────────────────────────┤
│                   Supabase Implementation                   │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

The A/B testing system uses the following tables in your Supabase database:

- `ab_tests`: Stores test metadata and metrics
- `ab_test_variants`: Stores variant information for each test
- `ab_test_assignments`: Records which variant each user is assigned to
- `ab_test_conversions`: Records conversion events

## Basic Usage

### Creating an A/B Test

```typescript
const { createTest } = useABTesting();

const newTest = await createTest({
  name: 'Homepage Headline Test',
  description: 'Testing different headlines on the homepage',
  goal: 'Increase signup conversion rate',
  variants: [
    { id: 'variant-a', name: 'Original', weight: 50 },
    { id: 'variant-b', name: 'New Version', weight: 50 }
  ]
});
```

### Using the ABTest Component

```tsx
<ABTest
  testId="homepage-headline-test"
  userId={userId}
  variants={{
    'variant-a': <h1>Welcome to Our Product</h1>,
    'variant-b': <h1>Discover the Future of SaaS</h1>
  }}
  fallback={<h1>Welcome to Our Product</h1>}
/>
```

### Tracking Conversions

```typescript
const { trackConversion } = useABTesting();

// When user completes the desired action
await trackConversion('homepage-headline-test', userId);
```

## Best Practices

1. **Test One Thing at a Time**: Focus each test on a single change to clearly understand what affects your metrics.

2. **Run Tests Long Enough**: Ensure you collect enough data for statistical significance (usually at least 100 conversions per variant).

3. **Define Clear Goals**: Each test should have a specific, measurable goal.

4. **Segment Your Results**: Analyze results across different user segments (e.g., new vs. returning users).

5. **Document Your Tests**: Keep a record of all tests, hypotheses, and results for future reference.

## Admin Dashboard

The A/B testing system includes an admin dashboard where you can:

- Create and manage tests
- View test results and metrics
- Start, pause, and complete tests
- Analyze conversion rates and statistical significance

## Integration with Marketing Components

The A/B testing system integrates seamlessly with the marketing components in Project Mosaic:

```tsx
<HeroSection
  title={
    <ABTest
      testId="hero-headline-test"
      userId={userId}
      variants={{
        'variant-a': "Build Your SaaS in Days, Not Months",
        'variant-b': "Launch Faster with Our SaaS Template"
      }}
    />
  }
  // Other props...
/>
```

## Troubleshooting

If you encounter issues with the A/B testing system, check:

1. That the test is in "running" status
2. That the test ID matches between your component and the database
3. That the user ID is being passed correctly
4. The browser console for any errors
