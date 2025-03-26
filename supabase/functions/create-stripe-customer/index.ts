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

console.log("🌍 Create Stripe Customer function is running...");

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

    // Get the user's profile
    console.log(`Fetching profile for user ID: ${userId}`);
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error(`Error fetching profile for user ${userId}:`, profileError);
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if the user already has a Stripe customer ID
    if (profile.stripe_customer_id) {
      console.log(`User ${userId} already has a Stripe customer ID: ${profile.stripe_customer_id}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          customerId: profile.stripe_customer_id,
          message: 'Customer already exists'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the user's email from auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError || !userData?.user) {
      console.error(`Error fetching user data for ${userId}:`, userError);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const email = userData.user.email;
    
    // Create a new Stripe customer
    console.log(`Creating Stripe customer for user ${userId} with email ${email}`);
    const customer = await stripe.customers.create({
      email: email,
      metadata: {
        user_id: userId
      }
    });

    console.log(`Created Stripe customer: ${customer.id}`);

    // Update the user's profile with the Stripe customer ID
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('user_id', userId);

    if (updateError) {
      console.error(`Error updating profile with Stripe customer ID for user ${userId}:`, updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update profile with Stripe customer ID' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Updated profile for user ${userId} with Stripe customer ID: ${customer.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        customerId: customer.id,
        message: 'Customer created successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating Stripe customer:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
