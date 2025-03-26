"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAI } from "@/lib/ai/hooks/useAI";
import { useAuth } from "@/hooks/useAuth";
import { createBrowserClient } from "@supabase/ssr";
import { useToast } from "@/components/hooks/use-toast";

export function AIAssistant() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { generateCompletion } = useAI();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
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
      
      // Get AI response
      const result = await generateCompletion([
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ]);
      
      setResponse(result);
      
      // Log the interaction to the database
      if (user) {
        await supabase.from("ai_interactions").insert({
          user_id: user.user_id,
          prompt_length: prompt.length,
          response_length: result.length,
          model_used: "gpt-3.5-turbo" // This would come from your AI service in a real implementation
        });
      }
      
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
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
            <Textarea
              placeholder="Enter your prompt here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
            />
            
            {response && (
              <div className="p-4 bg-muted rounded-md">
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
