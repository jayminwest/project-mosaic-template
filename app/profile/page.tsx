"use client";

import { Button } from "@/components/ui/button";
import { CreditCard, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";

export default function Profile() {
  const { user, isLoading, signOut, session } = useAuth();
  const { manageSubscription, error, isLoading: subscriptionLoading } = useSubscription();

  if (isLoading || !user) {
    return <LoadingSkeleton />;
  }
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p>Current Plan: {user.subscription_plan || 'Free'}</p>
            <p>
              Tasks Created: {user.tasks_created || 0} / {user.tasks_limit || 10}
            </p>
          </div>
          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-50 rounded-md">
              Error: {error}
            </div>
          )}
          <Button 
            onClick={() => {
              if (session?.access_token) {
                manageSubscription(session.access_token);
              } else {
                console.error("No access token available");
              }
            }}
            disabled={!session?.access_token || isLoading}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {isLoading ? "Loading..." : "Manage Subscription"}
          </Button>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button variant="outline" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
