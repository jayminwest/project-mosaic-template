# Tutorial 6B: Implementing Stripe Subscriptions

This tutorial guides you through implementing Stripe subscriptions in your Project Mosaic product. We'll create the database schema, implement edge functions for payment processing, and integrate subscription management into your frontend.

## Subscription Implementation Objectives

- **Database Schema**: Set up tables and triggers for subscription tracking
- **Edge Functions**: Create serverless functions for payment processing
- **Frontend Integration**: Implement subscription management UI
- **Webhook Handling**: Process subscription lifecycle events
- **Testing**: Verify the complete subscription flow

## Apply Database Migrations

The template includes a migration file `supabase/migrations/7_init_stripe_integration.sql` that sets up the Stripe integration:

```bash
# Apply the migration
supabase db push
```

This migration:
- Creates Stripe wrapper and foreign data tables
- Implements triggers for automatic Stripe customer creation/deletion
- Sets up security policies for Stripe data access

## Create Stripe Session Edge Function

The template includes a `create-stripe-session` edge function that handles subscription management. Deploy it:

```bash
# Deploy the function
supabase functions deploy create-stripe-session --project-ref your-project-id
```

Review the implementation in `supabase/functions/create-stripe-session/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const STRIPE_PRICE_ID = Deno.env.get("STRIPE_PRICE_ID")!;

// Initialize clients
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

serve(async (req) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get the access token
    const token = authHeader.replace("Bearer ", "");
    
    // Verify the user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();
      
    if (profileError) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get the price ID from the request (optional)
    const { priceId } = await req.json().catch(() => ({ priceId: null }));
    const finalPriceId = priceId || STRIPE_PRICE_ID;

    let url;
    
    // If the user already has a Stripe customer ID, create a billing portal session
    if (profile.stripe_customer_id) {
      const session = await stripe.billingPortal.sessions.create({
        customer: profile.stripe_customer_id,
        return_url: `${req.headers.get("origin")}/profile`,
      });
      url = session.url;
    } 
    // Otherwise, create a checkout session for a new subscription
    else {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: finalPriceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${req.headers.get("origin")}/profile?success=true`,
        cancel_url: `${req.headers.get("origin")}/profile?canceled=true`,
        client_reference_id: user.id,
      });
      url = session.url;
    }

    return new Response(JSON.stringify({ url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
```

## Deploy Stripe Webhook Handler

The template includes a `stripe-webhook` edge function that processes Stripe events:

```bash
# Deploy the webhook handler
supabase functions deploy stripe-webhook --project-ref your-project-id
```

Review the implementation in `supabase/functions/stripe-webhook/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

// Initialize clients
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  
  if (!signature) {
    return new Response(JSON.stringify({ error: "No signature" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Get the request body as text
    const body = await req.text();
    
    // Verify the webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Get the customer ID and user ID
        const customerId = session.customer as string;
        const userId = session.client_reference_id;
        
        if (!userId) {
          throw new Error("No client_reference_id in session");
        }
        
        // Update the user's profile with the Stripe customer ID
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ 
            stripe_customer_id: customerId,
            subscription_plan: "premium" 
          })
          .eq("user_id", userId);
          
        if (updateError) {
          throw new Error(`Error updating profile: ${updateError.message}`);
        }
        
        break;
      }
      
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Find the user with this Stripe customer ID
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("stripe_customer_id", customerId);
          
        if (profileError || !profiles.length) {
          throw new Error(`Error finding profile: ${profileError?.message || "No profile found"}`);
        }
        
        // Update the user's subscription plan to free
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ subscription_plan: "free" })
          .eq("stripe_customer_id", customerId);
          
        if (updateError) {
          throw new Error(`Error updating profile: ${updateError.message}`);
        }
        
        break;
      }
      
      // Add handlers for other events as needed
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});
```

## Disable JWT Verification for Webhook

Disable JWT verification for the webhook function since it receives requests directly from Stripe:

1. Go to your Supabase Dashboard → Edge Functions → stripe-webhook → Details
2. Disable "Enforce JWT Verification"

## Set Function Secrets

Set the required secrets for your edge functions:

```bash
# Set Stripe secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
supabase secrets set STRIPE_PRICE_ID=price_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## Implement Subscription UI

The template includes a `useSubscription` hook in `hooks/useSubscription.ts` that handles subscription management. Review and customize it for your product:

```typescript
// Example customization for your product
const fetchPlans = async () => {
  try {
    setIsLoading(true);
    setError(null);
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/list-subscription-plans`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    
    const { plans, error } = await response.json();
    
    if (error) throw new Error(error);
    
    // Filter or modify plans based on your product needs
    const productPlans = plans.filter(plan => 
      plan.name.includes("Your Product")
    );
    
    setPlans(productPlans);
  } catch (err: any) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
```

Create a subscription management component:

```tsx
// components/SubscriptionManager.tsx
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

export function SubscriptionManager() {
  const { plans, isLoading, error, manageSubscription } = useSubscription();
  const { user, session } = useAuth();
  
  if (isLoading) return <LoadingSkeleton />;
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-md">
        Error loading subscription information: {error}
      </div>
    );
  }
  
  const currentPlan = user?.subscription_plan || "free";
  const isPremium = currentPlan === "premium";
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Subscription</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.planType === currentPlan ? "border-primary" : ""}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                {plan.price > 0 
                  ? `$${plan.price}/${plan.interval}` 
                  : "Free"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {plan.planType === currentPlan ? (
                <Button disabled className="w-full">Current Plan</Button>
              ) : (
                <Button 
                  onClick={() => manageSubscription(session?.access_token, plan.priceId)}
                  className="w-full"
                >
                  {isPremium ? "Switch Plan" : "Upgrade"}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {isPremium && (
        <Button 
          variant="outline" 
          onClick={() => manageSubscription(session?.access_token)}
        >
          Manage Subscription
        </Button>
      )}
    </div>
  );
}
```

## Testing

The template includes tests for the subscription system in `tests/integration/6_payments.test.ts`. Run them:

```bash
npm test tests/integration/6_payments.test.ts
```

These tests verify:
1. A checkout event upgrades a user to premium
2. A subscription deleted event downgrades a user to free

If the tests fail with a 401 error, check that you've disabled JWT verification for your webhook function.

## Customizing for Your Product

To adapt the subscription system for your specific product:

1. **Update Plan Features**: Modify the Stripe product metadata to include features specific to your product
2. **Customize Subscription Tiers**: Adjust pricing and limits based on your product's value proposition
3. **Add Product-Specific Logic**: Implement any special handling needed when users upgrade or downgrade
4. **Enhance the UI**: Customize the subscription management UI to match your product's design

This tutorial provides a complete implementation of Stripe subscriptions for your Project Mosaic product. The system handles the entire subscription lifecycle, from initial signup to cancellation, with appropriate database updates at each step.
