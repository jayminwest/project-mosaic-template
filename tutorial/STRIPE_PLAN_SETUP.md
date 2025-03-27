# Setting Up Stripe Plans for Project Mosaic

This tutorial will guide you through the process of setting up Stripe subscription plans for your Project Mosaic application.

## Prerequisites

Before you begin, make sure you have:

1. A Stripe account (you can sign up at [stripe.com](https://stripe.com))
2. Your Stripe API keys (available in your Stripe Dashboard)
3. Project Mosaic installed and configured

## Step 1: Configure Your Stripe API Keys

First, you need to add your Stripe API keys to your environment variables:

1. Find your API keys in the [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Add them to your `.env.local` file:

```
STRIPE_SECRET_KEY=sk_test_your_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

## Step 2: Run the Interactive Setup Script

Project Mosaic includes an interactive script to help you set up your subscription plans:

```bash
npm run setup-subscription-plans
```

This script will:
1. Verify your Stripe API key
2. Guide you through creating Free, Premium, and Enterprise plans
3. Configure features and resource limits for each plan
4. Create the products and prices in Stripe with proper metadata

## Step 3: Understanding Plan Metadata

Stripe plans in Project Mosaic require specific metadata to work correctly:

### Required Metadata

Each Stripe product must have the following metadata:

1. **plan_type**: Identifies the subscription tier
   - Valid values: `free`, `premium`, `enterprise`
   - Example: `plan_type: premium`

2. **features**: Comma-separated list of features included in the plan
   - Example: `features: Advanced AI, Unlimited Storage, Priority Support`

3. **limit_xxx**: Resource limits for the plan (optional)
   - Use prefix `limit_` followed by the resource name
   - Example: `limit_storage: 50` (50MB storage limit)
   - Example: `limit_resources: 100` (100 resources limit)

### Individual Feature Metadata

You can also define individual features using numbered keys:

- `feature_1: "Feature description 1"`
- `feature_2: "Feature description 2"`
- `feature_3: "Feature description 3"`

## Step 4: Verify Your Configuration

After setting up your plans, verify that everything is configured correctly:

```bash
npm run test-subscription-plans
```

This will:
- Fetch all subscription plans from your Stripe account
- Display detailed information about each plan
- Validate the configuration for common issues

## Step 5: Test Plan Features

To test how your application handles different subscription plans and features:

```bash
npm run test-plan-features
```

This script will:
- Test resource limits for different plan types
- Check feature access across plans
- Simulate user interactions with different subscription levels

## Manual Setup (Alternative)

If you prefer to set up plans manually:

1. **Log in to Stripe Dashboard**
   - Go to [https://dashboard.stripe.com/](https://dashboard.stripe.com/)
   - Navigate to Products > Add Product

2. **Create Free Tier Product**
   - Name: "Free Plan"
   - Description: "Basic features for personal use"
   - Price: $0/month (recurring)
   - Metadata:
     - `plan_type: free`
     - `features: Basic AI, 10MB Storage, Standard Support`
     - `limit_storage: 10`
     - `limit_resources: 10`
     - `feature_1: "Basic AI capabilities"`
     - `feature_2: "10MB storage limit"`
     - `feature_3: "Standard support"`

3. **Create Premium Tier Product**
   - Name: "Premium Plan"
   - Description: "Advanced features for professionals"
   - Price: $9.99/month (recurring)
   - Metadata:
     - `plan_type: premium`
     - `features: Advanced AI, 50MB Storage, Priority Support`
     - `limit_storage: 50`
     - `limit_resources: 100`
     - `feature_1: "Advanced AI capabilities"`
     - `feature_2: "50MB storage limit"`
     - `feature_3: "Priority support"`
     - `feature_4: "Unlimited exports"`

## Troubleshooting

### Common Issues

1. **Plans Not Appearing in Your Application**
   - Ensure each product has the `plan_type` metadata field
   - Verify the metadata values are correctly formatted (must be exactly "free", "premium", or "enterprise")
   - Make sure each product has a default price assigned

2. **Feature Access Not Working Correctly**
   - Check that features are properly defined in the product metadata
   - Verify that your application is correctly checking for feature access
   - Test with the `test-plan-features` script to diagnose issues

3. **Resource Limits Not Applied**
   - Ensure limit metadata is correctly formatted with the `limit_` prefix
   - Check that your application is using the correct resource limit helpers
   - Verify that the limits are being enforced in your UI components

### Debugging Tools

If you encounter issues, use these debugging tools:

```bash
# Debug Stripe products configuration
npm run debug-stripe-products

# Test checkout flow
npm run test-checkout
```

## Next Steps

After setting up your subscription plans:

1. Test the checkout flow with a test credit card
2. Verify that users can upgrade and downgrade between plans
3. Ensure feature access is correctly enforced based on subscription level
4. Set up the Stripe Customer Portal for subscription management

For more detailed information, refer to the [Stripe Configuration Guide](../ai_docs/stripe-configuration.md).
