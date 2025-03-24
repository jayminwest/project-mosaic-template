import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0";

// Load environment variables
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") as string;
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }

  try {
    // Fetch all active products with their prices
    const products = await stripe.products.list({
      active: true,
      expand: ["data.default_price"],
    });

    // Format the products and prices for the frontend
    const plans = products.data
      .filter(product => product.metadata && product.metadata.plan_type) // Only include products with plan_type metadata
      .map(product => {
        const price = typeof product.default_price === 'object' ? product.default_price : null;
        
        if (!price) return null;
        
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          priceId: price.id,
          price: price.unit_amount ? price.unit_amount / 100 : 0, // Convert from cents to dollars
          currency: price.currency,
          interval: price.type === 'recurring' ? price.recurring?.interval : 'one-time',
          planType: product.metadata.plan_type,
        };
      })
      .filter(Boolean); // Remove null entries

    return new Response(
      JSON.stringify({ plans }),
      {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
