"use client";

import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardMetric } from "@/components/composed/DashboardMetric";
import { useAIMetrics } from "@/hooks/useAIMetrics";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

export function AIMetrics() {
  const { metrics, isLoading, error, refreshMetrics } = useAIMetrics();

  useEffect(() => {
    // Refresh metrics when component mounts
    refreshMetrics();
  }, []);

  if (isLoading) {
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
          <CardHeader>
            <CardTitle>Recent Interactions</CardTitle>
            <CardDescription>Your latest AI conversations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
