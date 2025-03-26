"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { DashboardMetric } from "@/components/composed/DashboardMetric";
import { useAIMetrics } from "@/hooks/useAIMetrics";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { createBrowserClient } from "@supabase/ssr";

export function AIMetrics() {
  const { metrics, isLoading, error, refreshMetrics } = useAIMetrics();
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Set up real-time subscription to AI interactions
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Initial fetch
    refreshMetrics();

    // Set up auto-refresh every 10 seconds
    const interval = setInterval(() => {
      refreshMetrics();
    }, 10000);
    setRefreshInterval(interval);

    // Set up real-time subscription
    const channel = supabase
      .channel('ai-metrics-changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'ai_interactions' 
        }, 
        () => {
          refreshMetrics();
        }
      )
      .subscribe();

    return () => {
      // Clean up
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      supabase.removeChannel(channel);
    };
  }, []);

  const handleManualRefresh = () => {
    refreshMetrics();
  };

  if (isLoading && !metrics) {
    return <LoadingSkeleton count={3} />;
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Usage Metrics</CardTitle>
          <CardDescription>Error loading metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleManualRefresh} variant="outline" size="sm">
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Usage Metrics</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Try using the AI Assistant to generate some metrics.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DashboardMetric
          title="Total Interactions"
          value={metrics.interactionCount}
          description="Number of AI requests made"
        />
        <DashboardMetric
          title="Tokens Used"
          value={metrics.tokensUsed}
          description="Total tokens consumed"
        />
        <DashboardMetric
          title="Avg. Response Length"
          value={metrics.averageResponseLength}
          description="Characters per response"
        />
      </div>

      {metrics.recentInteractions.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Interactions</CardTitle>
              <CardDescription>Your latest AI conversations</CardDescription>
            </div>
            <Button 
              onClick={handleManualRefresh} 
              variant="outline" 
              size="sm"
              className="h-8 px-2"
            >
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <div 
              className="space-y-4 overflow-y-auto pr-2" 
              style={{ maxHeight: "300px" }}
            >
              {metrics.recentInteractions.map((interaction) => (
                <div key={interaction.id} className="border-b pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {interaction.prompt_length} chars → {interaction.response_length} chars
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Model: {interaction.model_used}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(interaction.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
