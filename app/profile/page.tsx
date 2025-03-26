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
import { useState, useEffect } from "react";
import { createBrowserClient } from '@supabase/ssr';
import { toast } from "@/components/hooks/use-toast";

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
  
  // Initialize Supabase client
  const [supabase] = useState(() => 
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );
  
  // State for usage metrics
  const [usageMetrics, setUsageMetrics] = useState({
    storage_used: 0,
    api_calls: 0,
    resources_used: 0,
    projects_created: 0
  });
  
  // Helper function to calculate account age
  const getAccountAge = (createdAt: string): string => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return "Today";
    if (diffDays === 1) return "1 day";
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    }
    
    const years = Math.floor(diffDays / 365);
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  };
  
  // Fetch usage metrics
  useEffect(() => {
    const fetchUsageMetrics = async () => {
      if (!user?.user_id) return;
      
      try {
        const currentYearMonth = new Date().toISOString().slice(0, 7);
        
        const { data, error } = await supabase
          .from('usage_tracking')
          .select('*')
          .eq('user_id', user.user_id)
          .eq('year_month', currentYearMonth)
          .single();
        
        if (error) {
          console.error("Error fetching usage metrics:", error);
          return;
        }
        
        if (data) {
          setUsageMetrics({
            storage_used: data.storage_used || 0,
            api_calls: data.api_calls || 0,
            resources_used: data.resources_used || 0,
            projects_created: data.projects_created || 0
          });
        }
      } catch (error) {
        console.error("Error fetching usage metrics:", error);
      }
    };
    
    fetchUsageMetrics();
  }, [user, supabase]);

  if (isLoading || !user) {
    return <LoadingSkeleton type="form" count={3} />;
  }
  
  // Prepare usage data based on user metrics
  const usageData = [
    {
      name: "Tasks",
      current: user.tasks_created || 0,
      limit: user.tasks_limit || 10,
      unit: ""
    },
    {
      name: "Storage",
      current: usageMetrics.storage_used || 0,
      limit: currentPlan?.planType === 'premium' ? 50 : 10,
      unit: "MB"
    },
    {
      name: "API Calls",
      current: usageMetrics.api_calls || 0,
      limit: currentPlan?.planType === 'premium' ? 1000 : 100,
      unit: ""
    },
    {
      name: "Projects",
      current: usageMetrics.projects_created || 0,
      limit: currentPlan?.planType === 'premium' ? 10 : 3,
      unit: ""
    }
  ];

  // Function to save profile data
  const handleSaveProfile = async (data: { name: string; emailPreferences?: Record<string, boolean> }) => {
    if (!user?.user_id) return;
    
    setIsSaving(true);
    
    try {
      // Update profile in database
      const { data: updatedProfile, error } = await supabase.rpc(
        'update_user_profile',
        {
          p_user_id: user.user_id,
          p_name: data.name,
          p_email_preferences: data.emailPreferences ? JSON.stringify(data.emailPreferences) : null
        }
      );
      
      if (error) throw error;
      
      // Update local user state
      // In a real app, you would refresh the user data from the auth hook
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
      <p className="text-muted-foreground mb-6">Manage your personal information, subscription, and usage metrics</p>
      
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
          value={`${(usageMetrics.storage_used || 0).toFixed(1)} MB`}
          description={`of ${currentPlan?.planType === 'premium' ? '50' : '10'} MB available`}
          trend={
            usageMetrics.storage_used > 0 
              ? {
                  value: 5,
                  label: "from last month",
                  isPositive: false
                }
              : undefined
          }
        />
        
        <DashboardMetric 
          title="Account Age" 
          value={user.created_at ? getAccountAge(user.created_at) : "New"}
          description={user.created_at ? `Member since ${new Date(user.created_at).toLocaleDateString()}` : "Just joined"}
        />
      </div>
      
      <div className="flex justify-between mt-8">
        <Button variant="destructive" onClick={() => {
          if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            // In a real implementation, this would call an API to delete the account
            alert("Account deletion would be implemented here");
          }
        }}>
          Delete Account
        </Button>
        
        <Button variant="outline" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
