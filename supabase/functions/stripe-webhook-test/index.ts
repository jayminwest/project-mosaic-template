import { corsHeaders } from "../_shared/cors.ts";

// Simple test webhook function without any authorization checks
Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Log request details
  console.log(`Request received: ${req.method}`);
  console.log(`Headers: ${JSON.stringify(Object.fromEntries(req.headers))}`);
  
  try {
    // For POST requests, read the body
    let body = null;
    if (req.method === 'POST') {
      body = await req.text();
      console.log(`Request body length: ${body.length} characters`);
    }
    
    // Return a simple response
    return new Response(
      JSON.stringify({ 
        message: 'This is a test webhook endpoint with no authorization checks',
        method: req.method,
        bodyReceived: body ? true : false,
        bodyLength: body ? body.length : 0
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error in test webhook:", error.message);
    
    return new Response(
      JSON.stringify({ 
        error: "An error occurred",
        message: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
