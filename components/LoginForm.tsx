import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { LogIn, Mail, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useConfig } from "@/lib/config/useConfig";
import { Badge } from "@/components/ui/badge";

const LoginForm = () => {
  const {
    email,
    password,
    handleLogin,
    handleGoogleLogin,
    handleSignup,
    setEmail,
    setPassword,
    error,
    isSignUpMode,
    setIsSignUpMode,
    clearError,
  } = useAuth();
  
  const { productConfig } = useConfig();

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
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
          {isSignUpMode ? "Create Account" : "Welcome Back"}
        </h2>
        <div className="space-y-4">
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
          <form
            onSubmit={
              isSignUpMode
                ? (e) => {
                    e.preventDefault();
                    handleSignup();
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
              <div className="text-destructive text-sm text-center">{error}</div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  {isSignUpMode ? "Sign Up" : "Login"}
                </>
              )}
            </Button>
          </form>
          <p className="text-center text-sm">
            {isSignUpMode ? "Already have an account?" : "New account?"}{" "}
            <Link href="#" className="underline" onClick={toggleMode}>
              {isSignUpMode ? "Login" : "Sign up"}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default LoginForm;
