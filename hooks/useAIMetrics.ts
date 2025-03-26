"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useAuth } from "@/hooks/useAuth";

interface AIInteraction {
  id: string;
  user_id: string;
  prompt_length: number;
  response_length: number;
  model_used: string;
  created_at: string;
}

interface AIMetrics {
  interactionCount: number;
  tokensUsed: number;
  averagePromptLength: number;
  averageResponseLength: number;
  recentInteractions: AIInteraction[];
}

interface UseAIMetricsReturn {
  metrics: AIMetrics | null;
  isLoading: boolean;
  error: string | null;
  refreshMetrics: () => Promise<void>;
}

export function useAIMetrics(): UseAIMetricsReturn {
  const [metrics, setMetrics] = useState<AIMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchMetrics = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch profile metrics
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("ai_interactions_count, ai_tokens_used")
        .eq("user_id", user.user_id)
        .single();

      if (profileError) {
        throw new Error(`Error fetching profile metrics: ${profileError.message}`);
      }

      // Fetch recent interactions
      const { data: interactionsData, error: interactionsError } = await supabase
        .from("ai_interactions")
        .select("*")
        .eq("user_id", user.user_id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (interactionsError) {
        throw new Error(`Error fetching interactions: ${interactionsError.message}`);
      }

      // Calculate average lengths
      let totalPromptLength = 0;
      let totalResponseLength = 0;

      if (interactionsData && interactionsData.length > 0) {
        interactionsData.forEach((interaction: AIInteraction) => {
          totalPromptLength += interaction.prompt_length;
          totalResponseLength += interaction.response_length;
        });
      }

      const interactionCount = interactionsData.length;
      const averagePromptLength = interactionCount > 0 ? Math.round(totalPromptLength / interactionCount) : 0;
      const averageResponseLength = interactionCount > 0 ? Math.round(totalResponseLength / interactionCount) : 0;

      setMetrics({
        interactionCount: profileData.ai_interactions_count || 0,
        tokensUsed: profileData.ai_tokens_used || 0,
        averagePromptLength,
        averageResponseLength,
        recentInteractions: interactionsData as AIInteraction[]
      });
    } catch (err: any) {
      console.error("Error fetching AI metrics:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [user]);

  return {
    metrics,
    isLoading,
    error,
    refreshMetrics: fetchMetrics
  };
}
