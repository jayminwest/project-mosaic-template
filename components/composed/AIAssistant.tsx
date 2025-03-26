"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAI } from "@/lib/ai/hooks/useAI";
import { useAuth } from "@/hooks/useAuth";
import { createBrowserClient } from "@supabase/ssr";
import { useToast } from "@/components/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AIModelConfig } from "@/lib/ai/core/types";

// Define available providers and models
const AI_PROVIDERS = [
  { id: "openai", name: "OpenAI" },
  { id: "anthropic", name: "Anthropic" },
  { id: "local", name: "Local (Fallback)" },
];

const AI_MODELS = {
  openai: [
    { id: "gpt-4o", name: "GPT-4o" },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
  ],
  anthropic: [
    { id: "claude-3-7-sonnet-latest", name: "Claude 3 Sonnet" },
    { id: "claude-3-haiku-latest", name: "Claude 3 Haiku" },
  ],
  local: [
    { id: "local-fallback", name: "Local Fallback Model" },
  ],
};

export function AIAssistant() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState("openai");
  const [model, setModel] = useState("gpt-4o");
  const { generateCompletion } = useAI();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // Update model when provider changes
  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    // Set default model for the selected provider
    if (AI_MODELS[newProvider as keyof typeof AI_MODELS]) {
      setModel(AI_MODELS[newProvider as keyof typeof AI_MODELS][0].id);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a prompt to continue.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      setResponse("");
      
      // Check if API key is available for the selected provider
      if (provider === 'anthropic' && !process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
        throw new Error("Anthropic API key is not configured in the browser environment");
      }
      
      if (provider === 'openai' && !process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
        throw new Error("OpenAI API key is not configured in the browser environment");
      }
      
      // Configure AI request with selected provider and model
      const config: Partial<AIModelConfig> = {
        provider: provider,
        model: model,
      };
      
      // Get AI response
      const result = await generateCompletion([
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ], config);
      
      // Check if we got a fallback response
      if (result.includes("fallback") && result.includes("AI service is currently unavailable")) {
        throw new Error("API key issue: The AI service returned a fallback response");
      }
      
      setResponse(result);
      
      // Log the interaction to the database
      if (user) {
        await supabase.from("ai_interactions").insert({
          user_id: user.user_id,
          prompt_length: prompt.length,
          response_length: result.length,
          model_used: model // Use the selected model
        });
      }
      
    } catch (error: any) {
      console.error("Error getting AI response:", error);
      
      // Provide more specific error message
      let errorMessage = "Failed to get a response. Please try again.";
      
      if (error.message && error.message.includes("API key")) {
        errorMessage = "API key issue: Please check that your OpenAI or Anthropic API key is correctly configured.";
      } else if (error.message && error.message.includes("network")) {
        errorMessage = "Network error: Please check your internet connection.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Set a user-friendly error message in the response area
      setResponse("Error: " + errorMessage + "\n\nPlease make sure your API keys are correctly set in both .env.local and Supabase environment variables.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI Assistant</CardTitle>
        <CardDescription>
          Ask a question or request information from the AI assistant
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="provider">AI Provider</Label>
                <Select 
                  value={provider} 
                  onValueChange={handleProviderChange}
                >
                  <SelectTrigger id="provider">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_PROVIDERS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="model">AI Model</Label>
                <Select 
                  value={model} 
                  onValueChange={setModel}
                >
                  <SelectTrigger id="model">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_MODELS[provider as keyof typeof AI_MODELS]?.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Textarea
              placeholder="Enter your prompt here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
            />
            
            {response && (
              <div className="p-4 bg-muted rounded-md max-h-[300px] overflow-y-auto">
                <p className="whitespace-pre-wrap">{response}</p>
              </div>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          type="submit" 
          onClick={handleSubmit} 
          disabled={isLoading || !prompt.trim()}
          className="w-full"
        >
          {isLoading ? "Processing..." : "Submit"}
        </Button>
      </CardFooter>
    </Card>
  );
}
