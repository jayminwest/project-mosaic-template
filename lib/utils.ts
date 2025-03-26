import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

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
    const supabase = createClientComponentClient();
    const router = useRouter();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const returnPath = encodeURIComponent(window.location.pathname + window.location.search);
      router.push(`${redirectPath}?returnTo=${returnPath}`);
      return;
    }
    
    return callback(...args);
  };
};

