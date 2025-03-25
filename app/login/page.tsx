"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/hooks/use-toast";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, signInWithProvider } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await signIn(email, password);
      if (result.success) {
        router.push("/dashboard");
      } else {
        toast({
          title: "Login failed",
          description: result.error || "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Login error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await signUp(email, password);
      if (result.success) {
        toast({
          title: "Account created",
          description: "Please check your email to confirm your account.",
        });
        router.push("/dashboard");
      } else {
        toast({
          title: "Signup failed",
          description: result.error || "Please try again with a different email.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Signup error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithProvider("google");
      // No need to redirect as the OAuth flow will handle this
    } catch (error: any) {
      toast({
        title: "Google login error",
        description: error.message || "Failed to sign in with Google.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <Card className="w-full max-w-md mx-auto">
        <div className="w-full">
          <div className="flex w-full mb-4 border-b">
            <button 
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-2 text-center font-medium ${activeTab === "login" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
            >
              Login
            </button>
            <button 
              onClick={() => setActiveTab("signup")}
              className={`flex-1 py-2 text-center font-medium ${activeTab === "signup" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
            >
              Sign Up
            </button>
          </div>
          
          {activeTab === "login" && (
            <>
              <CardHeader>
                <CardTitle className="text-2xl">Welcome back</CardTitle>
                <CardDescription>
                  Sign in to your account to continue
                </CardDescription>
              </CardHeader>
              <CardContent>
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <Button
                variant="outline"
                type="button"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <FcGoogle className="mr-2 h-4 w-4" />
                Google
              </Button>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link href="#" className="text-primary underline" onClick={() => setActiveTab("signup")}>
                    Sign up
                  </Link>
                </p>
              </CardFooter>
            </>
          )}
          
          {activeTab === "signup" && (
            <>
              <CardHeader>
                <CardTitle className="text-2xl">Create an account</CardTitle>
                <CardDescription>
                  Sign up to get started with Project Mosaic
                </CardDescription>
              </CardHeader>
              <CardContent>
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters long
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <Button
                variant="outline"
                type="button"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <FcGoogle className="mr-2 h-4 w-4" />
                Google
              </Button>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="#" className="text-primary underline" onClick={() => setActiveTab("login")}>
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
