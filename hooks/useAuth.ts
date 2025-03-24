import { useState, useEffect } from "react";
import { User } from "@/types/models";
import { UseAuthReturn } from "@/types/auth";
import { getServiceProvider } from "@/lib/services";
import { sendWelcomeEmail } from "@/lib/auth/auth-emails";

export function useAuth(): UseAuthReturn {
  const services = getServiceProvider();
  const authService = services.getAuthService();

  // State
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  // Helper functions
  const clearError = () => setError(null);

  const updateSessionState = async (newSession: any) => {
    setSession(newSession);
    setIsLoggedIn(!!newSession);

    if (newSession?.user) {
      setIsLoading(true);
      try {
        const userProfile = await authService.getUserProfile(
          newSession.user.id, 
          newSession.user.email
        );
        
        setUser(userProfile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // Create a minimal user object with just the email
        setUser({
          email: newSession.user.email,
          user_id: newSession.user.id,
          subscription_plan: 'free',
          usage_metrics: { resources_used: 0, storage_used: 0 }
        } as User);
      }
    } else {
      setUser(null);
    }
    
    setIsLoading(false);
  };

  // Auth methods
  const signOut = async () => {
    try {
      const response = await authService.signOut();
      if (!response.success) {
        throw new Error(response.error);
      }
      
      setSession(null);
      setUser(null);
      setIsLoggedIn(false);
      setEmail("");
      setPassword("");
      window.localStorage.removeItem("supabase.auth.token");
    } catch (error: any) {
      setError(error.message);
      console.error("Error signing out:", error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      const response = await authService.signIn(email, password);
      if (!response.success) {
        setError(response.error);
      } else {
        console.log("✅ User logged in:", email);
      }
    } catch (error: any) {
      setError(error.message);
      console.error("Error logging in:", error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await authService.signInWithProvider("google");
    } catch (error: any) {
      setError(error.message);
      console.error("Error with Google login:", error);
    }
  };

  const handleSignup = async () => {
    clearError();
    try {
      const response = await authService.signUp(email, password);
      
      if (!response.success) {
        setError(response.error);
      } else {
        // Note: At this point, Supabase will send a confirmation email via SMTP
        // We don't need to send our own verification email
        setError("Please check your email to confirm your account");
        
        // Log for debugging
        console.log("✅ Signup initiated for:", email);
      }
    } catch (error: any) {
      setError(error.message);
      console.error("Error signing up:", error);
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("Initializing auth state...");
        setIsLoading(true);
        const session = await authService.getSession();
        console.log("Session retrieved:", !!session);
        await updateSessionState(session);
      } catch (error: any) {
        console.error("Error initializing auth:", error);
        setError(error.message);
        setIsLoading(false);
        await signOut();
      }
    };

    initAuth();

    const subscription = authService.onAuthStateChange((session) => {
      console.log("Auth state changed:", !!session);
      updateSessionState(session);
    });

    return () => {
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return {
    // State
    user,
    session,
    email,
    password,
    isLoggedIn,
    isLoading,
    error,
    isSignUpMode,

    // Operations
    signOut,
    handleLogin,
    handleGoogleLogin,
    handleSignup,
    setEmail,
    setPassword,
    setIsSignUpMode,
    clearError,
  };
}
