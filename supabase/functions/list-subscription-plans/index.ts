import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0";

// Load environment variables
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") as string;
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

// Helper function to parse features from metadata
function parseFeatures(product: Stripe.Product): string[] {
  const features: string[] = [];
  
  // Check for features in metadata
  if (product.metadata) {
    // Look for feature_1, feature_2, etc.
    for (let i = 1; i <= 10; i++) {
      const featureKey = `feature_${i}`;
      if (product.metadata[featureKey]) {
        features.push(product.metadata[featureKey]);
      }
    }
    
    // Also check for comma-separated features list
    if (product.metadata.features) {
      const metadataFeatures = product.metadata.features.split(',').map((f: string) => f.trim());
      features.push(...metadataFeatures);
    }
  }
  
  // If no features found, use the product description as a feature
  if (features.length === 0 && product.description) {
    features.push(product.description);
  }
  
  return features;
}

// Helper function to parse resource limits from metadata
function parseLimits(product: Stripe.Product): Record<string, number> | undefined {
  const limits: Record<string, number> = {};
  let hasLimits = false;
  
  if (product.metadata) {
    // Look for limit_ prefixed metadata
    for (const [key, value] of Object.entries(product.metadata)) {
      if (key.startsWith('limit_') && !isNaN(Number(value))) {
        const limitName = key.replace('limit_', '');
        limits[limitName] = Number(value);
        hasLimits = true;
      }
    }
    
    // Specific common limits
    if (product.metadata.resource_limit && !isNaN(Number(product.metadata.resource_limit))) {
      limits.resource = Number(product.metadata.resource_limit);
      hasLimits = true;
    }
    
    if (product.metadata.storage_limit && !isNaN(Number(product.metadata.storage_limit))) {
      limits.storage = Number(product.metadata.storage_limit);
      hasLimits = true;
    }
  }
  
  return hasLimits ? limits : undefined;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }
  
  // Accept both GET and POST methods
  if (req.method !== "GET" && req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      }
    );
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
    // Log headers for debugging
    console.log("Headers received:", Object.fromEntries(req.headers.entries()));
    
    return new Response(
      JSON.stringify({ error: "Unauthorized - API key required" }),
      {
        status: 401,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      }
    );
  }
  
  console.log("Auth token found:", authToken.substring(0, 10) + "...");

  try {
    // Log the request for debugging
    console.log("Processing list-subscription-plans request");
    
    // Fetch all active products with their prices
    console.log("Fetching products from Stripe...");
    const products = await stripe.products.list({
      active: true,
      expand: ["data.default_price"],
    });
    
    console.log(`Found ${products.data.length} products in Stripe`);
    
    // Log products for debugging
    products.data.forEach(product => {
      console.log(`Product: ${product.id}, Name: ${product.name}, Metadata: ${JSON.stringify(product.metadata || {})}`);
      console.log(`Default price: ${typeof product.default_price === 'object' ? product.default_price.id : product.default_price}`);
    });

    // Format the products and prices for the frontend
    const plans = products.data
      .filter(product => product.metadata && product.metadata.plan_type) // Only include products with plan_type metadata
      .map(product => {
        const price = typeof product.default_price === 'object' ? product.default_price : null;
        
        if (!price) {
          console.log(`Skipping product ${product.id} - no price object`);
          return null;
        }
        
        // Parse features and limits from metadata
        const features = parseFeatures(product);
        const limits = parseLimits(product);
        
        console.log(`Processing product ${product.id} with plan_type ${product.metadata.plan_type}`);
        console.log(`Features: ${features.join(', ')}`);
        console.log(`Limits: ${JSON.stringify(limits || {})}`);
        
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          priceId: price.id,
          price: price.unit_amount ? price.unit_amount / 100 : 0, // Convert from cents to dollars
          currency: price.currency,
          interval: price.type === 'recurring' ? price.recurring?.interval : 'one-time',
          planType: product.metadata.plan_type as 'free' | 'premium',
          features,
          ...(limits && { limits }),
        };
      })
      .filter(Boolean); // Remove null entries
    
    console.log(`Returning ${plans.length} formatted plans`);

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
