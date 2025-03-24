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
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
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

      if (profileResponse.error) throw profileResponse.error;

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
