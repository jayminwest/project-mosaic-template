"use client";

import { useState } from "react";
import { useConfig } from "@/lib/config/useConfig";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { DebugComponentRender } from "@/lib/debug-components";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function DashboardPage() {
  const { productConfig = { name: "Project Mosaic" }, theme } = useConfig();
  const { user, isLoading } = useAuth();
  const { currentPlan, isPremiumTier } = useSubscription();
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  // Add debug component
  return (
    <>
      <DebugComponentRender componentName="DashboardPage" />

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <LoadingSkeleton count={3} />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
            <h1 className="text-2xl font-bold mb-4">Please log in to access your dashboard</h1>
            <p className="text-muted-foreground mb-6">
              You need to be logged in to view this page
            </p>
            <Button asChild variant="default">
              <a href="/">Go to Login</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

      <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-3xl font-bold">{productConfig?.name || "Project Mosaic"} Dashboard</h1>
            <p className="text-muted-foreground mt-2 sm:mt-0">
              Welcome back, {user.name || user.email || "User"}
            </p>
          </div>
          
          {/* Dashboard Tabs */}
          <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
            <Button 
              variant={activeTab === "overview" ? "default" : "outline"}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </Button>
            <Button 
              variant={activeTab === "analytics" ? "default" : "outline"}
              onClick={() => setActiveTab("analytics")}
            >
              Analytics
            </Button>
            <Button 
              variant={activeTab === "settings" ? "default" : "outline"}
              onClick={() => setActiveTab("settings")}
            >
              Settings
            </Button>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Subscription Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Subscription</CardTitle>
                  <CardDescription>Current plan and usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Plan:</span>
                      <span className="font-medium">{currentPlan?.name || user.subscription_plan || "Free"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Storage Used:</span>
                      <span className="font-medium">
                        {user?.usage_metrics?.storage_used !== undefined 
                          ? (user.usage_metrics.storage_used).toFixed(2) 
                          : "0.00"} MB / 
                        {isPremiumTier ? 
                          productConfig?.limits?.premium?.storageLimit || 50 : 
                          productConfig?.limits?.free?.storageLimit || 5} MB
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => window.location.href = "/profile"}>
                    Manage Subscription
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Quick Actions Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and actions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full">Create New Item</Button>
                  <Button variant="outline" className="w-full">View Reports</Button>
                  <Button variant="outline" className="w-full">Invite Team Member</Button>
                </CardContent>
              </Card>
              
              {/* Recent Activity Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-b pb-2">
                      <p className="font-medium">Logged in</p>
                      <p className="text-sm text-muted-foreground">Just now</p>
                    </div>
                    <div className="border-b pb-2">
                      <p className="font-medium">Profile updated</p>
                      <p className="text-sm text-muted-foreground">Yesterday</p>
                    </div>
                    <div>
                      <p className="font-medium">Account created</p>
                      <p className="text-sm text-muted-foreground">3 days ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Your usage statistics and metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-medium mb-1">Total Resources</h3>
                    <p className="text-2xl font-bold">
                      {user?.usage_metrics?.resources_used || 0}
                    </p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-medium mb-1">Storage Used</h3>
                    <p className="text-2xl font-bold">
                      {user?.usage_metrics?.storage_used?.toFixed(2) || "0.00"} MB
                    </p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-medium mb-1">API Calls</h3>
                    <p className="text-2xl font-bold">
                      {user?.usage_metrics?.api_calls || 0}
                    </p>
                  </div>
                </div>
                <p className="text-center py-4 text-muted-foreground">
                  Detailed analytics dashboard will be available soon.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <div className="flex items-center justify-between border p-2 rounded-md">
                      <span>{user.email}</span>
                      <Button variant="ghost" size="sm">Change</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <div className="flex items-center justify-between border p-2 rounded-md">
                      <span>••••••••</span>
                      <Button variant="ghost" size="sm">Change</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <div className="flex items-center justify-between border p-2 rounded-md">
                      <span>{user.name || "Not set"}</span>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Customize your experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Email Notifications</span>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Dark Mode</span>
                    <Button variant="outline" size="sm">Toggle</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Language</span>
                    <Button variant="outline" size="sm">English</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
      </div>
    </>
  );
}
