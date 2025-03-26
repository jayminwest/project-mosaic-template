"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function APIKeyDebugger() {
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkAPIKeys = async () => {
    setIsLoading(true);
    try {
      // Check for environment variables
      const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      const anthropicKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
      
      let info = "API Key Status:\n\n";
      
      // Check OpenAI key
      if (openaiKey) {
        info += "✅ NEXT_PUBLIC_OPENAI_API_KEY is set\n";
        info += `   Length: ${openaiKey.length} characters\n`;
        info += `   Starts with: ${openaiKey.substring(0, 7)}...\n\n`;
      } else {
        info += "❌ NEXT_PUBLIC_OPENAI_API_KEY is not set\n\n";
      }
      
      // Check Anthropic key
      if (anthropicKey) {
        info += "✅ NEXT_PUBLIC_ANTHROPIC_API_KEY is set\n";
        info += `   Length: ${anthropicKey.length} characters\n`;
        info += `   Starts with: ${anthropicKey.substring(0, 7)}...\n\n`;
      } else {
        info += "❌ NEXT_PUBLIC_ANTHROPIC_API_KEY is not set\n\n";
      }
      
      info += "Note: For the AI service to work properly, at least one of these keys must be set.\n";
      info += "If you've set the keys in Supabase but not as NEXT_PUBLIC_ variables, they won't be accessible in the browser.\n";
      info += "Make sure to add them to your .env.local file with the NEXT_PUBLIC_ prefix.";
      
      setDebugInfo(info);
    } catch (error) {
      setDebugInfo("Error checking API keys: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Key Debugger</CardTitle>
        <CardDescription>
          Check if your AI API keys are properly configured
        </CardDescription>
      </CardHeader>
      <CardContent>
        {debugInfo ? (
          <pre className="p-4 bg-muted rounded-md whitespace-pre-wrap text-sm">
            {debugInfo}
          </pre>
        ) : (
          <p className="text-muted-foreground">
            Click the button below to check your API key configuration.
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={checkAPIKeys} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Checking..." : "Check API Keys"}
        </Button>
      </CardFooter>
    </Card>
  );
}
