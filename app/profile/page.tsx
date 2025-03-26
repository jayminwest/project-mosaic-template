"use client";

import { Button } from "@/components/ui/button";
import { CreditCard, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { SettingsForm } from "@/components/composed/SettingsForm";
import { UsageStats } from "@/components/composed/UsageStats";
import { DashboardMetric } from "@/components/composed/DashboardMetric";
import { useState } from "react";

export default function Profile() {
  const { user, isLoading, signOut, session } = useAuth();
  const { 
    manageSubscription, 
    currentPlan, 
    error, 
    isLoading: subscriptionLoading,
    cancelSubscription,
    clearError
  } = useSubscription();
  const [isSaving, setIsSaving] = useState(false);

  if (isLoading || !user) {
    return <LoadingSkeleton type="form" count={3} />;
  }

  // Prepare usage data
  const usageData = [
    {
      name: "Tasks",
      current: user.tasks_created || 0,
      limit: user.tasks_limit || 10,
      unit: ""
    },
    {
      name: "Storage",
      current: 2.5, // This would come from actual storage usage
      limit: currentPlan?.planType === 'premium' ? 50 : 10,
      unit: "MB"
    }
  ];

  // Mock function for saving profile - in a real app, this would call an API
  const handleSaveProfile = async (data: { name: string }) => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Saving profile data:", data);
    // In a real implementation, you would update the user profile in the database
    setIsSaving(false);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Settings */}
        <div className="md:col-span-2">
          <SettingsForm 
            user={user} 
            onSave={handleSaveProfile}
            isLoading={isSaving}
          />
        </div>
        
        {/* Right column - Subscription & Usage */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Manage your subscription plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm">Current Plan: <span className="font-medium">{currentPlan?.name || user.subscription_plan || 'Free'}</span></p>
                {currentPlan && currentPlan.planType !== 'free' && (
                  <p className="text-sm mt-1">
                    ${currentPlan.price}/{currentPlan.interval}
                  </p>
                )}
              </div>
              
              {error && (
                <div className="text-red-500 text-sm p-2 bg-red-50 rounded-md">
                  Error: {error}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-xs text-red-500 ml-2" 
                    onClick={clearError}
                  >
                    Dismiss
                  </Button>
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => {
                    if (session?.access_token) {
                      manageSubscription(session.access_token);
                    } else {
                      console.error("No access token available");
                    }
                  }}
                  disabled={!session?.access_token || subscriptionLoading}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {subscriptionLoading ? "Loading..." : "Manage Subscription"}
                </Button>
                
                {currentPlan && currentPlan.planType !== 'free' && (
                  <Button 
                    variant="outline" 
                    onClick={cancelSubscription}
                    disabled={subscriptionLoading}
                  >
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          
          <UsageStats usageData={usageData} />
        </div>
      </div>
      
      {/* Metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <DashboardMetric 
          title="Account Status" 
          value={currentPlan?.planType === 'premium' ? 'Premium' : 'Free'} 
          description={currentPlan?.planType === 'premium' ? 'Full access to all features' : 'Limited features'}
        />
        
        <DashboardMetric 
          title="Tasks Created" 
          value={user.tasks_created || 0} 
          description={`of ${user.tasks_limit || 10} available`}
        />
        
        <DashboardMetric 
          title="Storage Used" 
          value="2.5 MB" 
          description={`of ${currentPlan?.planType === 'premium' ? '50' : '10'} MB available`}
        />
        
        <DashboardMetric 
          title="Account Age" 
          value="28 days" 
          description="Member since last month"
        />
      </div>
      
      <div className="flex justify-end mt-8">
        <Button variant="outline" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
