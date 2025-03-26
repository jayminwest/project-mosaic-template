import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0";

// Load environment variables
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") as string;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const STRIPE_PRICE_ID = Deno.env.get("STRIPE_PRICE_ID");

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Parse request body
    let requestData = {};
    if (req.method === "POST") {
      try {
        requestData = await req.json();
      } catch (e) {
        console.error("Error parsing request body:", e);
      }
    }

    const { priceId, successUrl, cancelUrl } = requestData as {
      priceId?: string;
      successUrl?: string;
      cancelUrl?: string;
    };

    console.log("🔄 Authenticating user...");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(
      req.headers.get("Authorization")?.split(" ")[1] ?? ""
    );

    if (authError) {
      throw new Error(`Authentication failed: ${authError.message}`);
    }

    if (!user) {
      throw new Error("No user found");
    }

    console.log(`🔎 Looking for user_id ${user.id}`);

    // First try to get the profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id, subscription_plan")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      console.log("Profile error:", profileError);
      throw profileError;
    }

    if (!profile) {
      throw new Error("No profile found");
    }

    console.log(`🔎 Found profile: ${profile}`);
    if (!profile?.stripe_customer_id) {
      throw new Error("No Stripe customer found");
    }

    const originUrl = req.headers.get("origin") ?? "http://localhost:3000";
    const defaultSuccessUrl = `${originUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const defaultCancelUrl = `${originUrl}/checkout/cancel`;

    // Create Portal session if already subscribed
    if (profile.subscription_plan === "premium") {
      const session = await stripe.billingPortal.sessions.create({
        customer: profile.stripe_customer_id,
        return_url: successUrl || `${originUrl}/profile`,
      });
      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Checkout session for new subscribers
    const session = await stripe.checkout.sessions.create({
      customer: profile.stripe_customer_id,
      line_items: [
        {
          price: priceId || STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl || defaultSuccessUrl,
      cancel_url: cancelUrl || defaultCancelUrl,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in create-stripe-session:", error.message);
    return new Response(JSON.stringify({ 
      error: error.message,
      code: error.code || 'unknown_error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
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

console.log("🌍 Create Stripe Session function is running...");

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
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "Unauthorized - Authorization header required" }),
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

    // Verify the JWT token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Parse request body
    const { priceId, successUrl, cancelUrl } = await req.json();

    // Get the user's profile to find their Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      console.error(`Error fetching profile for user ${user.id}:`, profileError);
      return new Response(
        JSON.stringify({ error: "User profile not found" }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    let customerId = profile.stripe_customer_id;

    // If the user doesn't have a Stripe customer ID, create one
    if (!customerId) {
      console.log(`No Stripe customer ID found for user ${user.id}, creating one...`);
      
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id
        }
      });
      
      customerId = customer.id;
      
      // Update the user's profile with the new Stripe customer ID
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", user.id);
        
      if (updateError) {
        console.error(`Error updating profile with Stripe customer ID for user ${user.id}:`, updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update profile with Stripe customer ID" }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }
      
      console.log(`Created Stripe customer ${customerId} for user ${user.id}`);
    }

    // Default URLs if not provided
    const defaultSuccessUrl = `${req.headers.get("origin") || "http://localhost:3000"}/checkout/success`;
    const defaultCancelUrl = `${req.headers.get("origin") || "http://localhost:3000"}/checkout/cancel`;

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl || `${defaultSuccessUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || defaultCancelUrl,
      client_reference_id: user.id, // Store the user ID for webhook processing
    });

    return new Response(
      JSON.stringify({ success: true, url: session.url }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
