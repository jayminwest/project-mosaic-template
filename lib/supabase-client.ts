import { createClient } from '@supabase/supabase-js';

export function createSupabaseClient(accessToken?: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  const options = {
    global: {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    },
    auth: {
      persistSession: false
    }
  };
  
  const client = createClient(supabaseUrl, supabaseKey, options);
  
  // If an access token is provided, set it
  if (accessToken) {
    client.auth.setSession({
      access_token: accessToken,
      refresh_token: ''
    });
  }
  
  return client;
}
