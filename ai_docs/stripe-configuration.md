# Stripe Configuration Guide

This guide provides detailed instructions for configuring Stripe products and prices for Project Mosaic's subscription system.

## Overview

Project Mosaic uses Stripe for subscription management. The subscription system relies on proper configuration of Stripe products and prices, with specific metadata to identify plan types and features.

## Product Configuration

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

## Step-by-Step Configuration

### Automatic Setup (Recommended)

The easiest way to configure your subscription plans is to use our interactive setup script:

```bash
npm run setup-subscription-plans
```

This script will:
1. Check if your Stripe API key is configured
2. Guide you through creating Free, Premium, and Enterprise plans
3. Configure features and resource limits for each plan
4. Create the products and prices in Stripe with proper metadata
5. Set up default prices for each product

After setup, you can verify your configuration with:

```bash
npm run test-subscription-plans
```

### Manual Setup

If you prefer to configure plans manually:

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

4. **Create Enterprise Tier Product (Optional)**
   - Name: "Enterprise Plan"
   - Description: "Full-featured solution for teams"
   - Price: $29.99/month (recurring)
   - Metadata:
     - `plan_type: enterprise`
     - `features: Premium AI, Unlimited Storage, 24/7 Support, Team Collaboration`
     - `limit_storage: 500`
     - `limit_resources: 1000`
     - `feature_1: "Premium AI capabilities"`
     - `feature_2: "Unlimited storage"`
     - `feature_3: "24/7 dedicated support"`
     - `feature_4: "Team collaboration features"`
     - `feature_5: "Advanced analytics"`

## Verifying Configuration

After setting up your products, you can verify they're correctly configured by:

1. **Using the Test Script (Recommended)**

```bash
npm run test-subscription-plans
```

This will:
- Fetch all subscription plans from your Stripe account
- Display detailed information about each plan
- Validate the configuration for common issues
- Optionally test creating a checkout session

2. **Testing the List Subscription Plans Endpoint Manually**

```bash
curl -X POST "https://YOUR_PROJECT_ID.supabase.co/functions/v1/list-subscription-plans" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d "{}"
```

3. **Checking the Stripe Webhook**

The Stripe webhook should correctly map price IDs to plan types. You can verify this by checking the logs in the Supabase dashboard for the `stripe-webhook` function.

## Troubleshooting

If your subscription plans aren't appearing correctly:

1. **Check Product Metadata**
   - Ensure each product has the `plan_type` metadata field
   - Verify the metadata values are correctly formatted (must be exactly "free", "premium", or "enterprise")
   - Make sure features are properly defined either as comma-separated list or as individual feature_1, feature_2, etc.

2. **Verify Default Price**
   - Each product must have a default price assigned
   - The default price should be active
   - The price must be properly linked to the product

3. **Check Edge Function Logs**
   - Review the logs for the `list-subscription-plans` function in the Supabase dashboard
   - Look for any errors related to fetching or parsing products
   - Verify the Edge Function has proper authorization headers

4. **Test Webhook Mapping**
   - The `stripe-webhook` function logs should show successful mapping of price IDs to plan types
   - Verify the price-to-plan map is being correctly initialized
   - Check that both product and price metadata are being properly read

5. **Authorization Issues**
   - Ensure your Edge Functions accept both `apikey` header and `Authorization: Bearer` token format
   - Check that your payment service is sending the correct authorization headers
   - For webhook functions, disable JWT verification in `supabase/config.toml`:
     ```toml
     [functions.stripe-webhook]
     enabled = true
     verify_jwt = false
     ```
   - Test your webhook configuration with `npm run test-webhook`

6. **Webhook Authorization Bypass**
   - If your webhook functions return 401 Unauthorized errors despite disabling JWT verification in the dashboard:
     - Update `supabase/config.toml` with explicit JWT verification bypass
     - Deploy the functions again with `supabase functions deploy stripe-webhook`
     - Test with curl: `curl -X POST https://YOUR-PROJECT-ID.supabase.co/functions/v1/stripe-webhook -H "Content-Type: application/json" -d '{"test": true}'`

## Updating Plans

When updating your subscription plans:

1. **Create New Products/Prices**
   - Don't modify existing prices that customers are subscribed to
   - Create new products/prices with updated metadata

2. **Update Webhook Mapping**
   - The webhook should automatically detect new products/prices
   - Verify the mapping is correct in the logs

3. **Test Migration Path**
   - Test upgrading and downgrading between plans
   - Verify the correct plan type is assigned to the user's profile
