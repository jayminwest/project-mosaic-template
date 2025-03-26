import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0";

// Load environment variables
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") as string;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

console.log("🌍 Subscription Status function is running...");

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  // Check for authorization
  const apiKey = req.headers.get("apikey");
  const authHeader = req.headers.get("Authorization");
  
  // Extract token from Authorization header (Bearer token)
  let token = null;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }
  
  // Use either apikey header or token from Authorization header
  const authToken = apiKey || token;
  
  if (!authToken) {
    return new Response(
      JSON.stringify({ error: "Unauthorized - API key required" }),
      {
        status: 401,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
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
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the user's profile to find their Stripe customer ID
    console.log(`Fetching profile for user ID: ${userId}`);
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, subscription_plan')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error(`Error fetching profile for user ${userId}:`, profileError);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Profile data for user ${userId}:`, profiles);

    // If no Stripe customer ID, user is on free plan
    if (!profiles?.stripe_customer_id) {
      console.log(`No Stripe customer ID found for user ${userId}, using plan: ${profiles?.subscription_plan || 'free'}`);
      return new Response(
        JSON.stringify({ 
          subscription: null,
          plan_type: profiles?.subscription_plan || 'free'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const customerId = profiles.stripe_customer_id;
    console.log(`Fetching subscriptions for Stripe customer ID: ${customerId}`);

    // Get the customer's subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 1,
    });

    console.log(`Found ${subscriptions.data.length} subscriptions for customer ${customerId}`);

    if (subscriptions.data.length === 0) {
      console.log(`No subscriptions found for customer ${customerId}, using plan: ${profiles?.subscription_plan || 'free'}`);
      return new Response(
        JSON.stringify({ 
          subscription: null,
          plan_type: profiles?.subscription_plan || 'free'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const subscription = subscriptions.data[0];
    console.log(`Subscription details for customer ${customerId}:`, {
      id: subscription.id,
      status: subscription.status,
      plan_type: profiles?.subscription_plan
    });

    // Get the price ID from the subscription
    const priceId = subscription.items.data[0]?.price?.id;
    console.log(`Price ID from subscription: ${priceId}`);
    
    // Check if we need to update the profile's subscription_plan
    if (priceId) {
      try {
        // Get the product for this price
        const price = await stripe.prices.retrieve(priceId, {
          expand: ['product']
        });
        
        if (price.product && typeof price.product === 'object' && price.product.metadata?.plan_type) {
          const planType = price.product.metadata.plan_type;
          console.log(`Plan type from product metadata: ${planType}`);
          
          // If the profile's subscription_plan doesn't match the product's plan_type, update it
          if (profiles.subscription_plan !== planType) {
            console.log(`Updating profile subscription_plan from ${profiles.subscription_plan} to ${planType}`);
            
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ subscription_plan: planType })
              .eq('user_id', userId);
              
            if (updateError) {
              console.error(`Error updating subscription_plan for user ${userId}:`, updateError);
            } else {
              console.log(`Successfully updated subscription_plan to ${planType} for user ${userId}`);
              // Update the plan_type in our response
              profiles.subscription_plan = planType;
            }
          }
        }
      } catch (error) {
        console.error(`Error retrieving price details for ${priceId}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        subscription: {
          id: subscription.id,
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_end: subscription.current_period_end,
          current_period_start: subscription.current_period_start,
        },
        plan_type: profiles?.subscription_plan
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error getting subscription status:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
