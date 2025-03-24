"use client";

import { useState } from "react";
import { useConfig } from "@/lib/config/useConfig";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

export default function DashboardPage() {
  const { productConfig, theme } = useConfig();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("overview");

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <h1 className="text-2xl font-bold mb-4">Please log in to access your dashboard</h1>
        <p className="text-muted-foreground mb-6">
          You need to be logged in to view this page
        </p>
        <Button href="/" variant="default">
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">{productConfig.name} Dashboard</h1>
      
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
          <Card>
            <CardHeader>
              <CardTitle>Welcome, {user.name || user.email}</CardTitle>
              <CardDescription>
                Your {productConfig.name} dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>This is your personalized dashboard for {productConfig.name}.</p>
              <p className="mt-2">Current plan: <span className="font-medium">{user.subscription_plan || "Free"}</span></p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Your usage overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Resources Used:</span>
                  <span className="font-medium">
                    {user.usage_metrics?.resources_used || 0} / 
                    {user.subscription_plan === "premium" 
                      ? productConfig.limits.premium.resourceLimit 
                      : productConfig.limits.free.resourceLimit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Storage Used:</span>
                  <span className="font-medium">
                    {(user.usage_metrics?.storage_used || 0).toFixed(2)} MB / 
                    {user.subscription_plan === "premium" 
                      ? productConfig.limits.premium.storageLimit 
                      : productConfig.limits.free.storageLimit} MB
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Next steps for your project</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc pl-5">
                <li>Customize your profile settings</li>
                <li>Explore available features</li>
                <li>Check out the documentation</li>
                <li>Invite team members</li>
              </ul>
              <Button className="w-full mt-4" variant="outline">
                View Documentation
              </Button>
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
            <p className="text-center py-8 text-muted-foreground">
              Analytics dashboard will be available here.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Manage your account preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center py-8 text-muted-foreground">
              Settings panel will be available here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
