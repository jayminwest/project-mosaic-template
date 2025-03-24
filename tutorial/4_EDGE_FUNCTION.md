# Tutorial 4: AI Integration with Edge Functions

This tutorial guides you through implementing AI capabilities in your Project Mosaic product using Supabase Edge Functions. We'll create a provider-agnostic AI service that can be used across different products.

## AI Integration Objectives

- **Provider-Agnostic Design**: Create a flexible AI service that works with multiple providers
- **Edge Function Implementation**: Deploy serverless functions for AI processing
- **Prompt Management**: Implement a system for storing and optimizing prompts
- **Fallback Mechanisms**: Handle service unavailability gracefully
- **Product-Specific AI Features**: Implement AI capabilities tailored to your product

## Understanding Edge Functions

Supabase Edge Functions are serverless functions that:
- Execute in a Deno (TypeScript) environment
- Run on-demand in response to HTTP requests
- Can access environment variables and secrets
- Are ideal for integrating with external APIs like OpenAI

### Edge Function Limitations

- 500K free invocations per month (then $2 per million)
- Cold starts ranging from 200ms to 1500ms
- Max memory: 256MB
- Max function size: 20MB
- Max execution time: 150s (free tier) / 400s (paid)

## Create an AI Service Edge Function

1. Create a new edge function:

```sh
supabase functions new ai-service
```

2. Implement a provider-agnostic AI service in `supabase/functions/ai-service/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { OpenAI } from "https://esm.sh/openai@4.20.1";
import { Anthropic } from "https://esm.sh/@anthropic-ai/sdk@0.10.2";

// Environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// Provider interface
interface AIProvider {
  generateText(prompt: string, options?: any): Promise<string>;
}

// OpenAI implementation
class OpenAIProvider implements AIProvider {
  async generateText(prompt: string, options: any = {}): Promise<string> {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: options.model || "gpt-4o-mini",
      temperature: options.temperature || 0.3,
      max_tokens: options.maxTokens || 500,
    });
    
    return completion.choices[0]?.message?.content || "";
  }
}

// Anthropic implementation
class AnthropicProvider implements AIProvider {
  async generateText(prompt: string, options: any = {}): Promise<string> {
    const message = await anthropic.messages.create({
      model: options.model || "claude-3-haiku-20240307",
      max_tokens: options.maxTokens || 500,
      temperature: options.temperature || 0.3,
      system: options.systemPrompt || "You are a helpful assistant.",
      messages: [{ role: "user", content: prompt }],
    });
    
    return message.content[0]?.text || "";
  }
}

// Factory to get the appropriate provider
function getAIProvider(provider: string): AIProvider {
  switch (provider.toLowerCase()) {
    case "openai":
      return new OpenAIProvider();
    case "anthropic":
      return new AnthropicProvider();
    default:
      return new OpenAIProvider(); // Default to OpenAI
  }
}

// Main handler
serve(async (req) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers, status: 204 });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const { prompt, provider = "openai", options = {} } = await req.json();
    
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    // Get the appropriate AI provider
    const aiProvider = getAIProvider(provider);
    
    // Generate response
    const response = await aiProvider.generateText(prompt, options);
    
    // Return the AI response
    return new Response(JSON.stringify({ response }), {
      status: 200,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }
});
```

## Set Up API Keys

1. Get API keys for your AI providers:
   - OpenAI: https://platform.openai.com/api-keys
   - Anthropic: https://console.anthropic.com/settings/keys

2. Set the keys as secrets in your Supabase project:

```sh
supabase secrets set OPENAI_API_KEY="sk-xxx..."
supabase secrets set ANTHROPIC_API_KEY="sk-ant-xxx..."
```

3. Verify your secrets:

```sh
supabase secrets list
```

## Deploy the Edge Function

Deploy your AI service function:

```sh
supabase functions deploy ai-service --project-ref your-project-id
```

## Create a Client-Side AI Hook

Create a hook to interact with your AI service in `hooks/useAI.ts`:

```typescript
import { useState } from "react";
import { useAuth } from "./useAuth";

interface AIOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export function useAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  const generateText = async (
    prompt: string,
    provider: "openai" | "anthropic" = "openai",
    options: AIOptions = {}
  ) => {
    if (!session?.access_token) {
      setError("User not authenticated");
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-service`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            prompt,
            provider,
            options,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate text");
      }

      return data.response;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Implement fallback mechanism
  const generateTextWithFallback = async (
    prompt: string,
    options: AIOptions = {}
  ) => {
    // Try OpenAI first
    const openAIResponse = await generateText(prompt, "openai", options);
    if (openAIResponse) return openAIResponse;

    // If OpenAI fails, try Anthropic
    const anthropicResponse = await generateText(prompt, "anthropic", options);
    if (anthropicResponse) return anthropicResponse;

    // If both fail, return error
    setError("All AI providers failed to generate a response");
    return null;
  };

  return {
    generateText,
    generateTextWithFallback,
    isLoading,
    error,
  };
}
```

## Implement Product-Specific AI Features

Now, implement AI features specific to your product. For example, for a content calendar:

```typescript
// In your product service hook
import { useAI } from "./useAI";

export function useContentCalendar() {
  const { generateText, isLoading: aiLoading } = useAI();
  // ... other state and functions

  const generateContentIdeas = async (topic: string) => {
    const prompt = `Generate 5 content ideas related to "${topic}". For each idea, provide a title and a brief description. Format as a bulleted list.`;
    
    return await generateText(prompt, "openai", {
      temperature: 0.7,
      maxTokens: 500
    });
  };

  const improveContent = async (content: string) => {
    const prompt = `Improve the following content by making it more engaging, clear, and professional:\n\n${content}`;
    
    return await generateText(prompt, "anthropic", {
      systemPrompt: "You are an expert content editor who helps improve writing.",
      temperature: 0.4
    });
  };

  // ... return functions
  return {
    // ... other functions
    generateContentIdeas,
    improveContent,
    isAILoading: aiLoading
  };
}
```

## Create an AI Component

Create a reusable AI component for your product:

```tsx
// components/AIContentGenerator.tsx
import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { useContentCalendar } from "@/hooks/useContentCalendar";
import { LoadingSkeleton } from "./LoadingSkeleton";

export function AIContentGenerator() {
  const [topic, setTopic] = useState("");
  const [ideas, setIdeas] = useState<string | null>(null);
  const { generateContentIdeas, isAILoading } = useContentCalendar();

  const handleGenerate = async () => {
    if (!topic) return;
    const result = await generateContentIdeas(topic);
    if (result) {
      setIdeas(result);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">AI Content Generator</h3>
      
      <div className="flex gap-2">
        <Input
          placeholder="Enter a topic..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="flex-1"
        />
        <Button 
          onClick={handleGenerate} 
          disabled={!topic || isAILoading}
        >
          Generate Ideas
        </Button>
      </div>
      
      {isAILoading ? (
        <LoadingSkeleton />
      ) : ideas ? (
        <div className="p-4 bg-muted rounded-md whitespace-pre-line">
          {ideas}
        </div>
      ) : null}
    </div>
  );
}
```

## Testing

Create tests for your AI integration in `tests/integration/4_ai.test.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";
import { getOrCreateTestUser, cleanupTestUser } from "../test-utils/user-testing-utils";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

describe("AI Integration", () => {
  const testUser = {
    email: "test-ai-user@example.com",
    password: "Test123!@#",
  };
  let userId: string;
  let accessToken: string;

  beforeAll(async () => {
    const user = await getOrCreateTestUser(testUser);
    userId = user.id!;
    
    // Get access token for API calls
    const { data } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password,
    });
    
    accessToken = data.session!.access_token;
  }, 15000);

  afterAll(async () => {
    await cleanupTestUser(userId);
  }, 15000);

  test("can generate text with AI service", async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-service`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          prompt: "Write a short greeting",
          provider: "openai",
          options: {
            temperature: 0.3,
            maxTokens: 50,
          },
        }),
      }
    );

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.response).toBeTruthy();
    expect(typeof data.response).toBe("string");
  }, 30000); // Longer timeout for AI calls
});
```

Run the tests:

```sh
npm test tests/integration/4_ai.test.ts
```

This tutorial provides a foundation for implementing AI capabilities in your Project Mosaic product. The provider-agnostic design allows you to switch between AI providers or use different models for different tasks, providing flexibility and resilience.
