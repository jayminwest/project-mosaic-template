import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { createClient } from "@supabase/supabase-js"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Higher-order function that checks if a user is authenticated before executing a callback
 * If not authenticated, redirects to login with the current path as returnTo
 * 
 * @param callback Function to execute if authenticated
 * @param redirectPath Path to redirect to if not authenticated (default: /login)
 * @returns A function that checks auth before executing the callback
 */
export const withAuthCheck = (callback: Function, redirectPath = '/login') => {
  return async (...args: any[]) => {
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      // In a browser environment, redirect to login
      if (typeof window !== 'undefined') {
        const returnPath = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `${redirectPath}?returnTo=${returnPath}`;
      }
      return;
    }
    
    return callback(...args);
  };
};

