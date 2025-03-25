import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0";

// Load environment variables
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") as string;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("🌍 Update Subscription function is running...");

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

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
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Parse request body
    const { userId, newPriceId } = await req.json();

    if (!userId || !newPriceId) {
      return new Response(
        JSON.stringify({ error: 'User ID and new price ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the user's profile to find their Stripe customer ID
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (profileError || !profiles?.stripe_customer_id) {
      return new Response(
        JSON.stringify({ error: 'User not found or no Stripe customer ID' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const customerId = profiles.stripe_customer_id;

    // Get the customer's subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No active subscription found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the subscription with the new price
    const subscription = await stripe.subscriptions.update(
      subscriptions.data[0].id,
      {
        items: [
          {
            id: subscriptions.data[0].items.data[0].id,
            price: newPriceId,
          },
        ],
        // If the subscription was set to cancel at period end, remove that flag
        cancel_at_period_end: false,
      }
    );

    // Get the plan type from the price ID
    const planType = priceToPlanMap.get(newPriceId) || 'premium';

    console.log(`Updated subscription ${subscription.id} to plan ${planType}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        subscription: {
          id: subscription.id,
          status: subscription.status,
          current_period_end: subscription.current_period_end,
          plan_type: planType,
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating subscription:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
