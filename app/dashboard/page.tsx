"use client";

import React, { useState } from "react";
import { useConfig } from "@/lib/config/useConfig";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Footer } from "@/components/Footer";
import { AIAssistant } from "@/components/composed/AIAssistant";
import { AIMetrics } from "@/components/composed/AIMetrics";

export default function DashboardPage() {
  const { productConfig = { name: "Project Mosaic" }, theme } = useConfig();
  const { user, isLoading } = useAuth();
  const { currentPlan, isPremiumTier } = useSubscription();
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  if (isLoading) {
    return (
      <>
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow container mx-auto px-4 py-8">
            <LoadingSkeleton count={3} />
          </main>
          <Footer />
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <div className="flex flex-col min-h-screen">
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
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">{productConfig?.name || "Project Mosaic"}</h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {user.name || user.email || "User"}
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button asChild variant="outline" className="mr-2">
                <a href="/profile">Account Settings</a>
              </Button>
              <Button>New Project</Button>
            </div>
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
              variant={activeTab === "projects" ? "default" : "outline"}
              onClick={() => setActiveTab("projects")}
            >
              Projects
            </Button>
            <Button 
              variant={activeTab === "analytics" ? "default" : "outline"}
              onClick={() => setActiveTab("analytics")}
            >
              Analytics
            </Button>
            <Button 
              variant={activeTab === "ai" ? "default" : "outline"}
              onClick={() => setActiveTab("ai")}
            >
              AI Assistant
            </Button>
            <Button 
              variant={activeTab === "integrations" ? "default" : "outline"}
              onClick={() => setActiveTab("integrations")}
            >
              Integrations
            </Button>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Welcome Card */}
              <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-0">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                      <h2 className="text-2xl font-bold mb-2">Welcome to Your Dashboard</h2>
                      <p className="text-muted-foreground max-w-md">
                        This is where you'll manage your projects and access all the features of {productConfig?.name || "Project Mosaic"}.
                      </p>
                    </div>
                    <Button size="lg">Create New Project</Button>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Quick Stats Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                    <CardDescription>Your current usage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Active Projects</span>
                        <span className="font-medium text-lg">3</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Team Members</span>
                        <span className="font-medium text-lg">2</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Plan</span>
                        <span className="font-medium text-lg">{currentPlan?.name || user.subscription_plan || "Free"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Quick Actions Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common tasks and actions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full">Create New Project</Button>
                    <Button variant="outline" className="w-full">Invite Team Member</Button>
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab("ai")}>
                      Use AI Assistant
                    </Button>
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
                        <p className="font-medium">Project created</p>
                        <p className="text-sm text-muted-foreground">Just now</p>
                      </div>
                      <div className="border-b pb-2">
                        <p className="font-medium">Team member invited</p>
                        <p className="text-sm text-muted-foreground">Yesterday</p>
                      </div>
                      <div>
                        <p className="font-medium">Integration added</p>
                        <p className="text-sm text-muted-foreground">3 days ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Your Projects</h2>
                <Button>Create New Project</Button>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Project Card 1 */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle>Marketing Website</CardTitle>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Active</span>
                    </div>
                    <CardDescription>Last updated 2 days ago</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Company website with blog and contact form.
                    </p>
                    <div className="flex justify-between text-sm">
                      <span>2 team members</span>
                      <span>4 integrations</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">View</Button>
                    <Button variant="ghost" size="sm">Settings</Button>
                  </CardFooter>
                </Card>
                
                {/* Project Card 2 */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle>E-commerce Store</CardTitle>
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">In Progress</span>
                    </div>
                    <CardDescription>Last updated yesterday</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Online store with product catalog and checkout.
                    </p>
                    <div className="flex justify-between text-sm">
                      <span>3 team members</span>
                      <span>6 integrations</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">View</Button>
                    <Button variant="ghost" size="sm">Settings</Button>
                  </CardFooter>
                </Card>
                
                {/* Project Card 3 */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle>Mobile App</CardTitle>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Planning</span>
                    </div>
                    <CardDescription>Created 1 week ago</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      iOS and Android app for customer engagement.
                    </p>
                    <div className="flex justify-between text-sm">
                      <span>1 team member</span>
                      <span>2 integrations</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">View</Button>
                    <Button variant="ghost" size="sm">Settings</Button>
                  </CardFooter>
                </Card>
              </div>
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
                
                {/* Add AI Metrics to Analytics Tab */}
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">AI Usage</h3>
                  <AIMetrics />
                </div>
                
                <p className="text-center py-4 text-muted-foreground mt-6">
                  Detailed analytics dashboard will be available soon.
                </p>
              </CardContent>
            </Card>
          )}

          {/* AI Assistant Tab */}
          {activeTab === "ai" && (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                <AIAssistant />
                <AIMetrics />
              </div>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === "integrations" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Integrations</h2>
                <Button>Add New Integration</Button>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Integration Card 1 */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle>Stripe</CardTitle>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Connected</span>
                    </div>
                    <CardDescription>Payment processing</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Process payments and manage subscriptions.
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">Configure</Button>
                    <Button variant="ghost" size="sm">Disconnect</Button>
                  </CardFooter>
                </Card>
                
                {/* Integration Card 2 */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle>Google Analytics</CardTitle>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Connected</span>
                    </div>
                    <CardDescription>Analytics and tracking</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Track user behavior and website performance.
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">Configure</Button>
                    <Button variant="ghost" size="sm">Disconnect</Button>
                  </CardFooter>
                </Card>
                
                {/* Integration Card 3 */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle>Slack</CardTitle>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Not Connected</span>
                    </div>
                    <CardDescription>Team communication</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get notifications and updates in your Slack channels.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" size="sm">Connect</Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      </div>
    </>
  );
}
