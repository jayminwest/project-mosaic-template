import { createBrowserClient } from "@supabase/ssr";
import { User } from "@/types/models";

export interface AuthResponse {
  success: boolean;
  error?: string;
  data?: any;
}

export interface AuthConfig {
  redirectUrl?: string;
  providers?: string[];
  onAuthStateChange?: (session: any) => void;
}

export interface AuthProvider {
  getSession(): Promise<any>;
  signIn(email: string, password: string): Promise<AuthResponse>;
  signUp(email: string, password: string): Promise<AuthResponse>;
  signInWithProvider(provider: string): Promise<AuthResponse>;
  signOut(): Promise<AuthResponse>;
  getUserProfile(userId: string, userEmail: string): Promise<User | null>;
  onAuthStateChange(callback: (session: any) => void): any;
}

class SupabaseAuthProvider implements AuthProvider {
  private supabase;
  private config: AuthConfig;

  constructor(config: AuthConfig = {}) {
    this.config = {
      redirectUrl: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : '',
      providers: ['google'],
      ...config
    };

    this.supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  async getSession() {
    const { data } = await this.supabase.auth.getSession();
    return data.session;
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async signUp(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: { 
          emailRedirectTo: this.config.redirectUrl 
        },
      });

      if (error) return { success: false, error: error.message };
      
      // Even if signup appears successful, check if the user was actually created
      if (!data?.user?.id) {
        console.error("User signup failed: No user ID returned");
        return { 
          success: false, 
          error: "Failed to create user account. Please try again later." 
        };
      }
      
      return { success: true, data };
    } catch (error: any) {
      console.error("Signup error:", error);
      return { 
        success: false, 
        error: "An unexpected error occurred. Please try again later." 
      };
    }
  }

  async signInWithProvider(provider: string): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: this.config.redirectUrl,
        },
      });

      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async signOut(): Promise<AuthResponse> {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getUserProfile(userId: string, userEmail: string): Promise<User | null> {
    try {
      const [profileResponse, usageResponse] = await Promise.all([
        this.supabase.from("profiles").select("*").eq("user_id", userId).single(),
        this.supabase
          .from("usage_tracking")
          .select("*")
          .eq("user_id", userId)
          .eq("year_month", new Date().toISOString().slice(0, 7))
          .maybeSingle(),
      ]);

      if (profileResponse.error) {
        console.error("Profile fetch error:", profileResponse.error);
        
        // If the profile doesn't exist yet, try to create it
        if (profileResponse.error.code === 'PGRST116') {
          // Create a basic profile for the user
          const { data: newProfile, error: createError } = await this.supabase
            .from("profiles")
            .insert([{ user_id: userId, name: userEmail.split('@')[0] }])
            .select()
            .single();
            
          if (createError) {
            console.error("Error creating profile:", createError);
            throw createError;
          }
          
          return {
            ...newProfile,
            email: userEmail,
            usage_metrics: {},
          };
        } else {
          throw profileResponse.error;
        }
      }

      return {
        ...profileResponse.data,
        email: userEmail,
        usage_metrics: usageResponse.data || {},
      };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }

  onAuthStateChange(callback: (session: any) => void) {
    return this.supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  }
}

export function createAuthService(config: AuthConfig = {}): AuthProvider {
  return new SupabaseAuthProvider(config);
}
