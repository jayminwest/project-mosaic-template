# Tutorial 6A: Stripe Setup for Your Product

This tutorial guides you through setting up Stripe for your Project Mosaic product. We'll create a Stripe account, configure subscription products, and set up webhooks for payment processing.

## Stripe Setup Objectives

- **Stripe Account Setup**: Create and configure a Stripe account
- **Subscription Products**: Define your product's pricing tiers
- **Customer Portal**: Configure the portal for subscription management
- **Webhooks**: Set up event notifications for subscription lifecycle events
- **API Integration**: Collect necessary API keys and configuration values

## Create a Stripe Account

1. Go to [stripe.com](https://stripe.com) and create a new account or log in
2. Make sure you're in **Test Mode** (toggle in the upper right corner)
3. Note your API keys from **Developers > API Keys**:
   - **Publishable key** (`pk_test_...`)
   - **Secret key** (`sk_test_...`)

## Install the Stripe CLI

The Stripe CLI helps you manage Stripe resources and test webhooks locally:

```bash
# macOS (Homebrew)
brew install stripe/stripe-cli/stripe

# Windows (Scoop)
scoop install stripe

# Other platforms: https://stripe.com/docs/stripe-cli#install
```

Authenticate with your Stripe account:

```bash
# Log in to your Stripe account
stripe login

# Verify login worked
stripe config list
```

## Create Your Product and Pricing Tiers

You can create your subscription tiers using either the interactive setup script or manually with the Stripe CLI.

### Option 1: Using the Setup Script (Recommended)

The easiest way to set up your subscription plans is to use our interactive setup script:

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

### Option 2: Manual Setup with Stripe CLI

Alternatively, you can define your product's subscription tiers manually:

```bash
# Create a product for your Project Mosaic micro-SaaS
stripe products create --name="Your Product Name" \
  --description="Your product description" \
  -d "metadata[plan_type]=premium" \
  -d "metadata[features]=Feature 1, Feature 2, Feature 3" \
  -d "metadata[feature_1]=Advanced AI capabilities" \
  -d "metadata[feature_2]=50MB storage limit" \
  -d "metadata[feature_3]=Priority support" \
  -d "metadata[limit_storage]=50" \
  -d "metadata[limit_resources]=100"

# Save the product ID
PRODUCT_ID="prod_xxx"

# Create a free tier
stripe products create --name="Free Plan" \
  --description="Basic features for personal use" \
  -d "metadata[plan_type]=free" \
  -d "metadata[features]=Basic AI, 10MB Storage, Standard Support" \
  -d "metadata[feature_1]=Basic AI capabilities" \
  -d "metadata[feature_2]=10MB storage limit" \
  -d "metadata[feature_3]=Standard support" \
  -d "metadata[limit_storage]=10" \
  -d "metadata[limit_resources]=10"

# Save the free product ID
FREE_PRODUCT_ID="prod_yyy"

# Create a free tier price
stripe prices create \
  --product=$FREE_PRODUCT_ID \
  --currency=usd \
  --unit-amount=0 \
  -d "recurring[interval]"=month \
  -d "nickname"="Free Tier"

# Create a premium tier price ($19/month)
stripe prices create \
  --product=$PRODUCT_ID \
  --currency=usd \
  --unit-amount=1900 \
  -d "recurring[interval]"=month \
  -d "nickname"="Premium Tier"

# Set as default price for the products
stripe products update $FREE_PRODUCT_ID -d default_price=price_free_xxx
stripe products update $PRODUCT_ID -d default_price=price_premium_xxx

# List prices to get the price IDs
stripe prices list --product=$PRODUCT_ID
```

Save the price ID for your premium tier (`price_xxx`) - you'll need it for your implementation.

> **Important**: The `plan_type` metadata field is required and must be one of: "free", "premium", or "enterprise". This field is used to determine the subscription tier in your application.

## Configure the Customer Portal

Set up the Stripe Customer Portal where users can manage their subscriptions:

```bash
# Create portal configuration
stripe billing_portal configurations create \
  -d "business_profile[privacy_policy_url]=https://your-product.com/privacy" \
  -d "business_profile[terms_of_service_url]=https://your-product.com/terms" \
  -d "default_return_url=http://localhost:3000/profile" \
  -d "features[customer_update][enabled]=true" \
  -d "features[customer_update][allowed_updates][]=email" \
  -d "features[customer_update][allowed_updates][]=address" \
  -d "features[subscription_cancel][enabled]=true" \
  -d "features[payment_method_update][enabled]=true" \
  -d "features[invoice_history][enabled]=true"
```

For production, update the URLs to your actual privacy policy and terms of service pages.

## Set Up Webhooks

Configure webhooks to notify your application about subscription events:

1. Go to **Developers > Webhooks** in the Stripe Dashboard
2. Click **Add Endpoint**
3. Enter your webhook endpoint URL:
   ```
   https://[YOUR-PROJECT-ID].supabase.co/functions/v1/stripe-webhook
   ```
4. Select these events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
   - `invoice.payment_failed`
5. Click **Add Endpoint**
6. Save the **Signing Secret** (`whsec_...`)

## Create Subscription Plans in Supabase

Create a new edge function to list your subscription plans:

```bash
supabase functions new list-subscription-plans
```

Implement the function in `supabase/functions/list-subscription-plans/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }

  try {
    // Fetch all active products
    const products = await stripe.products.list({
      active: true,
      expand: ["data.default_price"],
    });

    // Format the products and prices for the frontend
    const plans = products.data.map((product) => {
      const price = product.default_price as Stripe.Price;
      
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        priceId: price.id,
        price: price.unit_amount ? price.unit_amount / 100 : 0,
        currency: price.currency,
        interval: price.type === "recurring" ? price.recurring?.interval : "one-time",
        planType: product.metadata.plan_type || "free",
        features: product.metadata.features ? JSON.parse(product.metadata.features) : [],
      };
    });

    return new Response(JSON.stringify({ plans }), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json",
      },
    });
  }
});
```

Deploy the function:

```bash
supabase functions deploy list-subscription-plans --project-ref your-project-id
```

## Store API Keys as Secrets

Set your Stripe API keys as secrets in Supabase:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
supabase secrets set STRIPE_PRICE_ID=price_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
```

Verify your secrets:

```bash
supabase secrets list
```

## Update Environment Variables

Add Stripe variables to your `.env.local` and `.env.test.local` files:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
NEXT_PUBLIC_SUBSCRIPTION_PRICE_ID=price_xxx
```

## Next Steps

With your Stripe account configured, you're ready to implement the subscription system in your Project Mosaic product. In the next tutorial, we'll:

1. Create the database schema for subscription tracking
2. Implement edge functions for payment processing
3. Create the frontend components for subscription management
4. Set up webhook handling for subscription lifecycle events

These steps will complete the integration between your product and Stripe's subscription system.
