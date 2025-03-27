# AI Service Guide

This guide provides detailed information on how to use the AI service in Project Mosaic.

## Overview

The AI service in Project Mosaic provides a provider-agnostic interface for integrating with multiple AI providers. It's designed to be flexible, resilient, and easy to use, with built-in fallback mechanisms and error handling.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      AIService Class                        │
├─────────────────────────────────────────────────────────────┤
│  - complete(options: AICompletionOptions)                   │
│  - streamComplete(options, callback)                        │
│  - embedText(text: string)                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Provider Interface                      │
├─────────────┬─────────────┬────────────────┬───────────────┤
│  OpenAI     │  Anthropic  │  Local         │  Custom       │
│  Provider   │  Provider   │  Provider      │  Provider     │
└─────────────┴─────────────┴────────────────┴───────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Prompt Management                       │
├─────────────────────────────────────────────────────────────┤
│  - Templates                                                │
│  - Versioning                                               │
│  - Formatting                                               │
└─────────────────────────────────────────────────────────────┘
```

## Setup and Configuration

### Environment Variables

The AI service requires the following environment variables:

```
# Primary AI provider (required)
NEXT_PUBLIC_AI_PROVIDER="openai" # Options: openai, anthropic, local
NEXT_PUBLIC_AI_MODEL="gpt-4o" # Default model to use

# API keys for different providers (add the ones you plan to use)
# IMPORTANT: For browser usage, add NEXT_PUBLIC_ prefix to these keys
NEXT_PUBLIC_OPENAI_API_KEY="sk-xxxx" # For browser usage
OPENAI_API_KEY="sk-xxxx" # For server-side usage

NEXT_PUBLIC_ANTHROPIC_API_KEY="sk-ant-xxxx" # For browser usage
ANTHROPIC_API_KEY="sk-ant-xxxx" # For server-side usage

# Fallback configuration (optional)
NEXT_PUBLIC_AI_FALLBACK_PROVIDER="anthropic" # Provider to use if primary fails
NEXT_PUBLIC_AI_FALLBACK_MODEL="claude-3-haiku-latest" # Model to use for fallback
```

### Automatic Setup

Run the setup script to configure the AI service:

```bash
npm run setup-ai-keys
```

This interactive script will:
1. Ask for your OpenAI and/or Anthropic API keys
2. Verify the API keys are valid
3. Update your environment variables
4. Configure fallback providers

## Using the AI Service

### Basic Usage with the useAI Hook

```typescript
import { useAI } from '@/lib/ai/hooks/useAI';

function MyComponent() {
  const { 
    generateCompletion, 
    generateStreamingCompletion,
    isLoading, 
    error 
  } = useAI();
  
  const handleSubmit = async (prompt: string) => {
    try {
      const response = await generateCompletion([
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
      ]);
      
      console.log('AI Response:', response);
    } catch (err) {
      console.error('Error:', err);
    }
  };
  
  return (
    <div>
      {/* Your UI components */}
    </div>
  );
}
```

### Streaming Completions

```typescript
import { useAI } from '@/lib/ai/hooks/useAI';
import { useState } from 'react';

function StreamingExample() {
  const { generateStreamingCompletion, isLoading } = useAI();
  const [result, setResult] = useState('');
  
  const handleStream = async (prompt: string) => {
    setResult('');
    
    await generateStreamingCompletion(
      [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
      ],
      (chunk) => {
        setResult(prev => prev + chunk);
      }
    );
  };
  
  return (
    <div>
      <button onClick={() => handleStream('Tell me a story')} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate Story'}
      </button>
      <div>{result}</div>
    </div>
  );
}
```

### Using Templates

```typescript
import { useAI } from '@/lib/ai/hooks/useAI';

function TemplateExample() {
  const { generateFromTemplate, isLoading } = useAI();
  
  const handleGenerate = async () => {
    const response = await generateFromTemplate(
      'content-generation',
      {
        count: 5,
        topic: 'artificial intelligence',
        style: 'informative'
      }
    );
    
    console.log('Generated content:', response);
  };
  
  return (
    <button onClick={handleGenerate} disabled={isLoading}>
      Generate Content
    </button>
  );
}
```

### Creating Custom Templates

You can add your own templates to the prompt management system:

```typescript
import { PromptManager } from '@/lib/ai/prompts';

// Create a new prompt manager or get the existing one
const promptManager = new PromptManager();

// Add a new template
promptManager.addTemplate({
  id: 'product-description',
  version: '1.0.0',
  description: 'Generates product descriptions',
  category: 'marketing',
  systemPrompt: 'You are a marketing copywriter who creates compelling product descriptions.',
  userPrompt: 'Create a product description for {{productName}} that highlights {{features}}.',
});

// Use the template
const messages = promptManager.formatPrompt('product-description', {
  productName: 'AI Writing Assistant',
  features: 'grammar correction, style suggestions, content generation'
});
```

## AI Usage Tracking

The system automatically tracks AI usage in the database:

```typescript
// After a successful AI interaction
await supabase.from('ai_interactions').insert({
  user_id: userId,
  prompt_length: prompt.length,
  response_length: response.length,
  model_used: config.model || 'default',
  created_at: new Date().toISOString()
});
```

You can view usage metrics using the AIMetrics component or by querying the database directly.

## Implementing Usage Limits

The system enforces usage limits based on the user's subscription plan:

```typescript
import { getResourceLimit } from '@/lib/config/plan-access';

// Check if user has reached their AI interaction limit
const aiLimit = getResourceLimit(user.subscription_plan || 'free', 'AIInteractions');
const currentUsage = user.usage_metrics?.ai_interactions_count || 0;

if (currentUsage >= aiLimit) {
  return {
    error: 'You have reached your AI usage limit for this month.',
    upgradeRequired: true
  };
}
```

## Error Handling

The AI service includes robust error handling with automatic fallbacks:

```typescript
try {
  return await provider.complete(options);
} catch (error) {
  console.error(`Error with provider ${config.provider}:`, error);
  
  // Try fallback providers
  for (const fallbackProvider of this.fallbackProviders) {
    try {
      console.log(`Trying fallback provider: ${fallbackProvider}`);
      return await this.providers[fallbackProvider].complete(options);
    } catch (fallbackError) {
      console.error(`Error with fallback provider ${fallbackProvider}:`, fallbackError);
    }
  }
  
  throw new Error('All AI providers failed');
}
```

## Best Practices

1. **Use System Messages Effectively**
   - Always include a system message to set the context and tone
   - Keep system messages concise but informative

2. **Handle Errors Gracefully**
   - Always wrap AI calls in try/catch blocks
   - Provide user-friendly error messages
   - Implement fallback content when AI fails

3. **Optimize for Cost and Performance**
   - Use smaller models for simpler tasks
   - Implement caching for common requests
   - Monitor token usage to control costs

4. **Respect Rate Limits**
   - Implement throttling for high-volume requests
   - Add exponential backoff for retries

5. **Secure API Keys**
   - Never expose API keys in client-side code without NEXT_PUBLIC_ prefix
   - Use environment variables for all sensitive credentials
   - Implement proper access controls for AI features

6. **Test Thoroughly**
   - Test with different inputs and edge cases
   - Verify fallback mechanisms work correctly
   - Test with API keys intentionally disabled to ensure graceful degradation

7. **Monitor Usage**
   - Track token usage and costs
   - Monitor error rates and performance
   - Set up alerts for unusual activity
