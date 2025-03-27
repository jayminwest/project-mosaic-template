# AI Service API Reference

This document provides a comprehensive reference for the AI service API in Project Mosaic.

## Core Types

### AIModelConfig

Configuration options for AI model requests:

```typescript
interface AIModelConfig {
  provider: 'openai' | 'anthropic' | 'local';
  model: string;
  temperature: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}
```

### AIMessage

Represents a message in a conversation:

```typescript
interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
```

### AICompletionOptions

Options for AI completion requests:

```typescript
interface AICompletionOptions {
  messages: AIMessage[];
  config?: Partial<AIModelConfig>;
  stream?: boolean;
  functions?: AIFunction[];
}
```

### AIFunction

Function definition for function calling:

```typescript
interface AIFunction {
  name: string;
  description: string;
  parameters: Record<string, any>;
}
```

### AIProvider

Interface that all AI providers must implement:

```typescript
interface AIProvider {
  complete(options: AICompletionOptions): Promise<string>;
  streamComplete(options: AICompletionOptions, callback: (chunk: string) => void): Promise<void>;
  embedText(text: string): Promise<number[]>;
}
```

## AIService Class

The `AIService` class provides a provider-agnostic interface for interacting with AI models.

### Constructor

```typescript
constructor(config?: Partial<AIModelConfig>)
```

Creates a new AIService instance with optional default configuration.

### Methods

#### complete

```typescript
async complete(options: AICompletionOptions): Promise<string>
```

Sends a completion request to the AI provider and returns the response as a string.

**Parameters:**
- `options`: The completion options including messages and configuration

**Returns:**
- A Promise that resolves to the AI-generated text

**Example:**
```typescript
const aiService = new AIService();
const response = await aiService.complete({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Tell me a joke about programming.' }
  ],
  config: {
    model: 'gpt-4o',
    temperature: 0.7
  }
});
```

#### streamComplete

```typescript
async streamComplete(
  options: AICompletionOptions, 
  callback: (chunk: string) => void
): Promise<void>
```

Streams a completion request to the AI provider, calling the callback function with each chunk of the response.

**Parameters:**
- `options`: The completion options including messages and configuration
- `callback`: A function that will be called with each chunk of the response

**Example:**
```typescript
const aiService = new AIService();
await aiService.streamComplete(
  {
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Write a short story about AI.' }
    ],
    config: {
      model: 'gpt-4o',
      temperature: 0.7
    }
  },
  (chunk) => {
    // Append chunk to UI or process it
    console.log(chunk);
  }
);
```

#### embedText

```typescript
async embedText(text: string, provider?: string): Promise<number[]>
```

Generates vector embeddings for the provided text.

**Parameters:**
- `text`: The text to embed
- `provider`: Optional provider to use for embedding (defaults to the default provider)

**Returns:**
- A Promise that resolves to an array of numbers representing the embedding

**Example:**
```typescript
const aiService = new AIService();
const embedding = await aiService.embedText("This is a sample text to embed");
```

## useAI Hook

The `useAI` hook provides a React interface for the AI service.

### Usage

```typescript
const {
  isLoading,
  error,
  result,
  streamingResult,
  generateCompletion,
  generateStreamingCompletion,
  generateFromTemplate,
  generateStreamingFromTemplate,
  promptManager
} = useAI(options);
```

### Parameters

- `options`: Optional configuration for the AI service
  - `defaultConfig`: Default configuration for AI requests

### Return Value

- `isLoading`: Boolean indicating if a request is in progress
- `error`: Error message if the request failed, or null
- `result`: The result of the last non-streaming completion
- `streamingResult`: The accumulated result of the last streaming completion
- `generateCompletion`: Function to generate a completion
- `generateStreamingCompletion`: Function to generate a streaming completion
- `generateFromTemplate`: Function to generate a completion using a prompt template
- `generateStreamingFromTemplate`: Function to generate a streaming completion using a prompt template
- `promptManager`: Instance of the PromptManager for managing prompt templates

### Methods

#### generateCompletion

```typescript
async generateCompletion(
  messages: AIMessage[],
  config?: Partial<AIModelConfig>
): Promise<string>
```

Generates a completion from the provided messages.

**Example:**
```typescript
const { generateCompletion } = useAI();

const response = await generateCompletion([
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'What is the capital of France?' }
]);
```

#### generateStreamingCompletion

```typescript
async generateStreamingCompletion(
  messages: AIMessage[],
  config?: Partial<AIModelConfig>
): Promise<string>
```

Generates a streaming completion from the provided messages, updating the `streamingResult` state as chunks arrive.

**Example:**
```typescript
const { generateStreamingCompletion, streamingResult } = useAI();

useEffect(() => {
  generateStreamingCompletion([
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Write a poem about AI.' }
  ]);
}, []);

return <div>{streamingResult}</div>;
```

#### generateFromTemplate

```typescript
async generateFromTemplate(
  templateId: string,
  params: PromptParams,
  config?: Partial<AIModelConfig>
): Promise<string>
```

Generates a completion using a prompt template.

**Example:**
```typescript
const { generateFromTemplate } = useAI();

const response = await generateFromTemplate(
  'content-generation',
  {
    count: 5,
    topic: 'artificial intelligence',
    style: 'informative'
  }
);
```

#### generateStreamingFromTemplate

```typescript
async generateStreamingFromTemplate(
  templateId: string,
  params: PromptParams,
  config?: Partial<AIModelConfig>
): Promise<string>
```

Generates a streaming completion using a prompt template, updating the `streamingResult` state as chunks arrive.

**Example:**
```typescript
const { generateStreamingFromTemplate, streamingResult } = useAI();

useEffect(() => {
  generateStreamingFromTemplate(
    'content-generation',
    {
      count: 5,
      topic: 'artificial intelligence',
      style: 'informative'
    }
  );
}, []);

return <div>{streamingResult}</div>;
```

## AI Providers

Project Mosaic includes implementations for multiple AI providers:

### OpenAIProvider

Provider for OpenAI's models (GPT-4, GPT-3.5, etc.).

**Configuration:**
- Environment variables:
  - `OPENAI_API_KEY` (server-side)
  - `NEXT_PUBLIC_OPENAI_API_KEY` (client-side)
- Default model: `gpt-4o`

### AnthropicProvider

Provider for Anthropic's Claude models.

**Configuration:**
- Environment variables:
  - `ANTHROPIC_API_KEY` (server-side)
  - `NEXT_PUBLIC_ANTHROPIC_API_KEY` (client-side)
- Default model: `claude-3-7-sonnet-latest`

### LocalProvider

Fallback provider that provides simple responses without external API calls.

## Error Handling

The AI service includes robust error handling with automatic fallbacks:

1. If the primary provider fails, the service will try fallback providers in sequence
2. If all providers fail, the service will throw an error with the message "All AI providers failed"
3. The `useAI` hook captures these errors and provides them through the `error` state

**Example of handling errors:**
```typescript
const { generateCompletion, error, isLoading } = useAI();

const handleSubmit = async () => {
  try {
    const response = await generateCompletion([
      { role: 'user', content: prompt }
    ]);
    setResult(response);
  } catch (err) {
    console.error('Failed to generate completion:', err);
  }
};

// In your UI
{error && <div className="error">{error}</div>}
```
