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
    // First check if there's a comma-separated features list
    if (product.metadata.features) {
      return product.metadata.features.split(',').map(f => f.trim());
    }
    
    // If not, look for feature_1, feature_2, etc.
    for (let i = 1; i <= 10; i++) {
      const featureKey = `feature_${i}`;
      if (product.metadata[featureKey]) {
        features.push(product.metadata[featureKey]);
      }
    }
    
    // Also check for comma-separated features list
    if (product.metadata.features) {
      const metadataFeatures = product.metadata.features.split(',').map((f: string) => f.trim());
      // Avoid duplicates by checking if feature already exists
      metadataFeatures.forEach(feature => {
        if (!features.includes(feature)) {
          features.push(feature);
        }
      });
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
    const plansPromises = products.data
      .filter(product => {
        // Log all products for debugging
        console.log(`Checking product ${product.id} (${product.name})`);
        console.log(`Metadata: ${JSON.stringify(product.metadata || {})}`);
        
        // Check if product has plan_type metadata
        const hasPlanType = product.metadata && product.metadata.plan_type;
        if (!hasPlanType) {
          console.log(`Skipping product ${product.id} - no plan_type metadata`);
        }
        return hasPlanType;
      })
      .map(async (product) => {
        console.log(`Processing product ${product.id} (${product.name})`);
        
        // Get the price object
        let price: any = null;
        
        if (typeof product.default_price === 'object') {
          price = product.default_price;
          console.log(`Using object price: ${price.id}`);
          console.log(`Price details: ${JSON.stringify({
            unit_amount: price.unit_amount,
            currency: price.currency,
            type: price.type,
            recurring: price.recurring
          })}`);
        } else if (product.default_price) {
          // If default_price is just an ID, we need to fetch the price
          console.log(`Need to fetch price: ${product.default_price}`);
          try {
            // Fetch the price from Stripe
            const fetchedPrice = await stripe.prices.retrieve(product.default_price as string);
            price = fetchedPrice;
            console.log(`Fetched price: ${price.id}`);
            console.log(`Fetched price details: ${JSON.stringify({
              unit_amount: price.unit_amount,
              currency: price.currency,
              type: price.type,
              recurring: price.recurring
            })}`);
          } catch (error) {
            console.error(`Error fetching price ${product.default_price}:`, error);
            console.error(`Error details: ${JSON.stringify(error)}`);
            // Create a temporary price object with basic info as fallback
            price = {
              id: product.default_price,
              unit_amount: 0,
              currency: 'usd',
              type: 'recurring',
              recurring: { interval: 'month' }
            };
            console.log(`Created fallback price object: ${JSON.stringify(price)}`);
          }
        } else {
          console.log(`Product ${product.id} has no default_price`);
        }
        
        if (!price) {
          console.log(`Skipping product ${product.id} - no price object`);
          return null;
        }
        
        // Parse features and limits from metadata
        const features = parseFeatures(product);
        const limits = parseLimits(product);
        
        console.log(`Processing product ${product.id} with plan_type ${product.metadata.plan_type}`);
        console.log(`Features: ${features.length > 0 ? features.join(', ') : 'none'}`);
        console.log(`Limits: ${JSON.stringify(limits || {})}`);
        
        try {
          // Create the plan object with detailed logging
          console.log("Creating plan object with:");
          console.log(`- ID: ${product.id}`);
          console.log(`- Name: ${product.name}`);
          console.log(`- Description: ${product.description || product.name}`);
          console.log(`- Price ID: ${price.id}`);
          console.log(`- Price amount: ${price.unit_amount}`);
          console.log(`- Currency: ${price.currency}`);
          console.log(`- Interval: ${price.type === 'recurring' && price.recurring ? price.recurring.interval : 'month'}`);
          console.log(`- Plan type: ${product.metadata.plan_type}`);
          
          const plan = {
            id: product.id,
            name: product.name,
            description: product.description || product.name,
            priceId: price.id,
            price: price.unit_amount ? price.unit_amount / 100 : 0, // Convert from cents to dollars
            currency: price.currency || 'usd',
            interval: price.type === 'recurring' && price.recurring ? price.recurring.interval : 'month',
            planType: product.metadata.plan_type as 'free' | 'premium',
            features,
            ...(limits && { limits }),
          };
          
          console.log(`Created plan object: ${JSON.stringify(plan)}`);
          return plan;
        } catch (error) {
          console.error(`Error creating plan object for ${product.id}:`, error);
          console.error(`Error details: ${JSON.stringify(error)}`);
          // Return an empty object instead of null to help diagnose the issue
          return {};
        }
      })
      .filter(Boolean); // Remove null entries
    
    // Wait for all promises to resolve
    let plans = [];
    try {
      plans = await Promise.all(plansPromises);
      console.log(`Resolved ${plans.length} plan promises`);
      
      // Log each plan for debugging
      plans.forEach((plan, index) => {
        console.log(`Plan ${index}:`, JSON.stringify(plan));
      });
      
      // Filter out null values
      plans = plans.filter(plan => plan !== null);
      console.log(`After filtering nulls: ${plans.length} plans`);
      
      // Check if we have valid plans
      if (plans.length === 0 || plans.some(plan => Object.keys(plan).length === 0)) {
        console.log("No valid plans found or some plans are empty objects, using fallback plans");
        plans = getFallbackPlans();
      }
    } catch (promiseError) {
      console.error("Error resolving plan promises:", promiseError);
      // Return fallback plans with error info
      plans = getFallbackPlans();
    }
    
    console.log(`Returning ${plans.length} formatted plans`);

    return new Response(
      JSON.stringify({ 
        plans,
        debug: plans.length === 0 ? { message: "No valid plans found in Stripe" } : undefined
      }),
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
      JSON.stringify({ 
        plans: getFallbackPlans(),
        debug: { message: "Error fetching plans from Stripe", error: error.message }
      }),
      {
        status: 200, // Return 200 with fallback plans instead of 500
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

// Function to provide fallback plans when Stripe API fails
function getFallbackPlans() {
  console.log("Returning fallback plans");
  return [
    {
      id: "free_plan",
      name: "Free",
      description: "Basic features for personal use",
      priceId: "price_free",
      price: 0,
      currency: "usd",
      interval: "month",
      planType: "free",
      features: [
        "Basic functionality",
        "Limited storage (10MB)",
        "Email support"
      ]
    },
    {
      id: "premium_plan",
      name: "Premium",
      description: "Advanced features for professionals",
      priceId: "price_premium",
      price: 9.99,
      currency: "usd",
      interval: "month",
      planType: "premium",
      features: [
        "Basic functionality",
        "Unlimited storage",
        "Email support",
        "Advanced features",
        "Priority support"
      ]
    }
  ];
}
