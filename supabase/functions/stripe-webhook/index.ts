import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0";

// Load environment variables
const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") as string;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

console.log("🌍 Stripe Webhook is running...");

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

// This is needed in order to use the Web Crypto API in Deno.
const cryptoProvider = Stripe.createSubtleCryptoProvider();

// Map Stripe price IDs to subscription plans
const priceToPlanMap = new Map();

// Initialize price to plan mapping
async function initializePriceToPlanMap() {
  try {
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
    });
    
    for (const product of products.data) {
      if (product.metadata && product.metadata.plan_type) {
        const priceId = typeof product.default_price === 'object' 
          ? product.default_price.id 
          : product.default_price;
        
        if (priceId) {
          priceToPlanMap.set(priceId, product.metadata.plan_type);
          console.log(`Mapped price ${priceId} to plan ${product.metadata.plan_type}`);
        }
      }
    }
  } catch (error) {
    console.error("Error initializing price to plan map:", error);
  }
}

// Initialize the price map when the function starts
initializePriceToPlanMap();

Deno.serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const body = await req.text();

  try {
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      WEBHOOK_SECRET,
      undefined,
      cryptoProvider
    );

    console.log(`Received event: ${event.type}`);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        
        // Get the line items to find the price ID
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        if (lineItems.data.length > 0) {
          const priceId = lineItems.data[0].price?.id;
          
          // Get the plan type from the price ID, default to "premium" if not found
          const planType = priceId && priceToPlanMap.has(priceId) 
            ? priceToPlanMap.get(priceId) 
            : "premium";
          
          await supabase
            .from("profiles")
            .update({
              subscription_plan: planType,
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_customer_id", session.customer);
          
          console.log(`Updated user to plan: ${planType} for customer: ${session.customer}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await supabase
          .from("profiles")
          .update({
            subscription_plan: "free",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", subscription.customer);
        break;
      }
      
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        
        // Get the price ID from the subscription
        const priceId = subscription.items.data[0]?.price?.id;
        
        if (priceId && priceToPlanMap.has(priceId)) {
          const planType = priceToPlanMap.get(priceId);
          
          await supabase
            .from("profiles")
            .update({
              subscription_plan: planType,
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_customer_id", subscription.customer);
          
          console.log(`Updated subscription to plan: ${planType} for customer: ${subscription.customer}`);
        }
        break;
      }
    }

    console.log("✅ Webhook processed successfully");
    return new Response(JSON.stringify({ received: true }));
  } catch (error) {
    console.error("Error in stripe-webhook:", error.message);
    return new Response(JSON.stringify({ error: error.message }));
  }
});
