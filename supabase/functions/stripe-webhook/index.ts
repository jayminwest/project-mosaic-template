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
    
    // Also fetch all prices to ensure we have complete mapping
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
    });
    
    for (const price of prices.data) {
      if (price.product && typeof price.product === 'object' && 
          price.product.metadata && price.product.metadata.plan_type) {
        priceToPlanMap.set(price.id, price.product.metadata.plan_type);
        console.log(`Mapped price ${price.id} to plan ${price.product.metadata.plan_type}`);
      }
    }
    
    console.log(`Price to plan map initialized with ${priceToPlanMap.size} entries`);
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
        
        console.log(`Processing checkout.session.completed for session: ${session.id}`);
        
        // Get the line items to find the price ID
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        console.log(`Found ${lineItems.data.length} line items for session ${session.id}`);
        
        if (lineItems.data.length > 0) {
          const priceId = lineItems.data[0].price?.id;
          console.log(`Price ID from line item: ${priceId}`);
          
          // Get the plan type from the price ID, default to "premium" if not found
          const planType = priceId && priceToPlanMap.has(priceId) 
            ? priceToPlanMap.get(priceId) 
            : "premium";
          
          console.log(`Mapped plan type: ${planType} for price ID: ${priceId}`);
          console.log(`Price to plan map has ${priceToPlanMap.size} entries`);
          
          // Get subscription details to check for trial period
          const subscriptions = await stripe.subscriptions.list({
            customer: session.customer,
            limit: 1,
          });
          
          console.log(`Found ${subscriptions.data.length} subscriptions for customer: ${session.customer}`);
          
          const subscription = subscriptions.data[0];
          const isTrialing = subscription?.status === 'trialing';
          
          // First, check if the customer ID exists in profiles
          const { data: existingProfiles, error: fetchError } = await supabase
            .from("profiles")
            .select("*")
            .eq("stripe_customer_id", session.customer);
            
          if (fetchError) {
            console.error(`Error fetching profiles for customer ${session.customer}:`, fetchError);
          } else {
            console.log(`Found ${existingProfiles?.length || 0} profiles with stripe_customer_id: ${session.customer}`);
          }
          
          // Update the profile
          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              subscription_plan: planType,
              subscription_status: subscription?.status || 'active',
              subscription_trial_end: subscription?.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_customer_id", session.customer);
            
          // If no rows were updated, the customer ID might not exist in profiles
          // Try to find the user by the client_reference_id (which should be the user_id)
          if (updateError || (existingProfiles && existingProfiles.length === 0)) {
            console.log(`No profile found with stripe_customer_id: ${session.customer}, trying client_reference_id`);
            
            if (session.client_reference_id) {
              console.log(`Updating profile with user_id: ${session.client_reference_id}`);
              
              // First check if the user exists
              const { data: userProfile, error: userProfileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("user_id", session.client_reference_id)
                .single();
                
              if (userProfileError) {
                console.error(`Error finding user profile for ${session.client_reference_id}:`, userProfileError);
              } else if (userProfile) {
                console.log(`Found user profile for ${session.client_reference_id}`);
                
                // Update the stripe_customer_id
                const { error: userIdUpdateError } = await supabase
                  .from("profiles")
                  .update({
                    stripe_customer_id: session.customer,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("user_id", session.client_reference_id);
                
              if (userIdUpdateError) {
                console.error(`Error updating stripe_customer_id for user ${session.client_reference_id}:`, userIdUpdateError);
              } else {
                console.log(`Updated stripe_customer_id for user ${session.client_reference_id}`);
                
                // Now update the subscription details
                const { error: planUpdateError } = await supabase
                  .from("profiles")
                  .update({
                    subscription_plan: planType,
                    subscription_status: subscription?.status || 'active',
                    subscription_trial_end: subscription?.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("user_id", session.client_reference_id);
                  
                if (planUpdateError) {
                  console.error(`Error updating subscription plan for user ${session.client_reference_id}:`, planUpdateError);
                } else {
                  console.log(`Updated subscription plan to ${planType} for user ${session.client_reference_id}`);
                }
              }
            }
          }
          
          if (updateError) {
            console.error(`Error updating profile for customer ${session.customer}:`, updateError);
          } else {
            console.log(`Updated user to plan: ${planType} for customer: ${session.customer}, trial: ${isTrialing}`);
            
            // Verify the update was successful
            const { data: updatedProfile, error: verifyError } = await supabase
              .from("profiles")
              .select("subscription_plan, subscription_status")
              .eq("stripe_customer_id", session.customer)
              .single();
              
            if (verifyError) {
              console.error(`Error verifying profile update for customer ${session.customer}:`, verifyError);
            } else {
              console.log(`Verified profile update: subscription_plan=${updatedProfile.subscription_plan}, subscription_status=${updatedProfile.subscription_status}`);
            }
          }
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
