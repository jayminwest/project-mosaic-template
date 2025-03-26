import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { LogIn, Mail, Lock, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useConfig } from "@/lib/config/useConfig";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const LoginForm = () => {
  const router = useRouter();
  const {
    email,
    password,
    handleLogin: authLogin,
    handleGoogleLogin: authGoogleLogin,
    handleSignup,
    setEmail,
    setPassword,
    error,
    isSignUpMode,
    setIsSignUpMode,
    clearError,
    isLoading,
  } = useAuth();
  
  const [verificationSent, setVerificationSent] = useState(false);
  const [returnTo, setReturnTo] = useState<string | null>(null);
  const { productConfig } = useConfig();
  
  // Extract returnTo parameter from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const returnToParam = params.get('returnTo');
      if (returnToParam) {
        setReturnTo(returnToParam);
      }
    }
  }, []);
  
  // Wrap the original login handler to handle returnTo
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await authLogin(e);
    if (success && returnTo) {
      router.push(returnTo);
    }
  };
  
  // Wrap the original Google login handler to store returnTo
  const handleGoogleLogin = async () => {
    if (returnTo) {
      // Store returnTo in localStorage for OAuth callback
      localStorage.setItem('authReturnTo', returnTo);
      
      // If the returnTo contains a subscribe parameter, also store that
      if (returnTo.includes('subscribe=')) {
        const subscribeParam = new URLSearchParams(returnTo.split('?')[1]).get('subscribe');
        if (subscribeParam) {
          localStorage.setItem('pendingSubscription', subscribeParam);
        }
      }
    }
    await authGoogleLogin();
  };

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setVerificationSent(false);
    clearError();
  };

  return (
    <section aria-label={isSignUpMode ? "Sign Up Form" : "Login Form"}>
      <div className="max-w-md mx-auto">
        <div className="flex justify-center mb-4">
          <Badge variant="secondary" className="px-3 py-1">
            {productConfig?.slug || "project-mosaic"}
          </Badge>
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center">
          {verificationSent ? "Check Your Email" : (isSignUpMode ? "Create Account" : "Welcome Back")}
        </h2>
        <div className="space-y-4">
          {!verificationSent && (
            <>
              <Button className="w-full" onClick={handleGoogleLogin}>
                <LogIn className="mr-2 h-4 w-4" />
                Login with Google
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
            </>
          )}
          
          {verificationSent ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Verification Email Sent!</h3>
                <p className="text-muted-foreground">
                  We've sent a verification link to <span className="font-medium">{email}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Please check your inbox and click the link to activate your account.
                </p>
                <p className="text-xs text-muted-foreground mt-4">
                  Don't see the email? Check your spam folder or try again.
                </p>
              </div>
              <div className="pt-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setVerificationSent(false);
                    setIsSignUpMode(false);
                  }}
                >
                  Return to Sign In
                </Button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={
                isSignUpMode
                  ? async (e) => {
                      e.preventDefault();
                      await handleSignup();
                      // If no error was set during signup, we can assume it was successful
                      if (!error) {
                        setVerificationSent(true);
                      }
                    }
                  : handleLogin
              }
              className="space-y-4"
            >
              <div className="relative">
                <Input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="username email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              <div className="relative">
                <Input
                  type="password"
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              {error && (
                <div className="p-3 bg-destructive/15 rounded-md text-destructive text-sm">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin -ml-1 mr-3 h-4 w-4" />
                    {isSignUpMode ? "Creating Account..." : "Signing In..."}
                  </span>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    {isSignUpMode ? "Sign Up" : "Login"}
                  </>
                )}
              </Button>
              <p className="text-center text-sm">
                {isSignUpMode ? "Already have an account?" : "New account?"}{" "}
                <Link href="#" className="underline" onClick={toggleMode}>
                  {isSignUpMode ? "Login" : "Sign up"}
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default LoginForm;
