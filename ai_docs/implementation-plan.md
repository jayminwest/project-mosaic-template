# Project Mosaic Implementation Plan

This document outlines the step-by-step implementation plan for transforming the Task App into a template for Project Mosaic.

## Phase 1: Template Cleanup & Core Structure

- [x] **Remove Task-Specific Components**
  - [x] Clean up Supabase migration files:
    - `/supabase/migrations/1_init_tasks.sql`
    - `/supabase/migrations/5_init_task_limit_triggers.sql`
    - `/supabase/migrations/6_init_account_tier_triggers.sql`
  - [x] Remove task-specific edge functions:
    - `/supabase/functions/create-task-with-ai/index.ts`
  - [x] Remove task-specific components, pages, hooks, and types:
    - Components: `CreateTaskForm.tsx`, `TaskList.tsx`, `TaskRow.tsx`
    - Pages: `/app/task/page.tsx`, `/app/dashboard/page.tsx`
    - Hooks: `/hooks/useTaskManager.ts`
    - Types: `/types/taskManager.ts`
    - Tests: `1_task_crud.test.ts`, `5_task_limits.test.ts`
    - Utilities: `/lib/labels.ts`
  - [x] Standardize test file naming with proper sequence (01_core, 02_auth, etc.)
  - [x] Clean up tutorial files specific to the task app
  - [x] Standardize micro-SaaS terminology across documentation

- [x] **Database Schema Restructuring**
  - [x] Combine core Supabase migrations into a single initialization file
  - [x] Update database schema to be more generic and reusable
  - [x] Update types to match the exact database structure
  - [x] Refine subscription plan structure for better extensibility

- [x] **Core Project Structure**
  - [x] Create core directories for the new architecture:
    - `/lib/ai` - AI service abstraction
    - `/lib/config` - Configuration system
    - `/lib/email` - Email service system ✅
    - `/components/marketing` - Marketing components
    - `/components/analytics` - Analytics components
  - [ ] Set up configuration system for project customization
  - [ ] Update environment variable structure with better documentation
  - [ ] Create placeholder dashboard page

## Phase 2: Essential Service Layers

- [ ] **AI Service Layer**
  - [ ] Create `/lib/ai/core/types.ts` with base interfaces
    ```typescript
    // Define core interfaces for AI service
    export interface AIModelConfig {
      provider: 'openai' | 'anthropic' | 'local';
      model: string;
      temperature: number;
      maxTokens?: number;
      topP?: number;
      frequencyPenalty?: number;
      presencePenalty?: number;
    }

    export interface AIMessage {
      role: 'system' | 'user' | 'assistant';
      content: string;
    }

    export interface AICompletionOptions {
      messages: AIMessage[];
      config?: Partial<AIModelConfig>;
      stream?: boolean;
      functions?: AIFunction[];
    }

    export interface AIFunction {
      name: string;
      description: string;
      parameters: Record<string, any>;
    }

    export interface AIProvider {
      complete(options: AICompletionOptions): Promise<string>;
      streamComplete(options: AICompletionOptions, callback: (chunk: string) => void): Promise<void>;
      embedText(text: string): Promise<number[]>;
    }
    ```
    
  - [ ] Create `/lib/ai/core/ai-service.ts` with provider-agnostic interface
    ```typescript
    import { AICompletionOptions, AIModelConfig, AIProvider } from './types';
    import { OpenAIProvider } from '../providers/openai';
    import { AnthropicProvider } from '../providers/anthropic';
    import { LocalProvider } from '../providers/local';

    // Default configuration
    const defaultConfig: AIModelConfig = {
      provider: 'openai',
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 1000,
    };

    export class AIService {
      private providers: Record<string, AIProvider>;
      private defaultProvider: string;
      private fallbackProviders: string[];
      
      constructor(config?: Partial<AIModelConfig>) {
        // Initialize providers
        this.providers = {
          openai: new OpenAIProvider(),
          anthropic: new AnthropicProvider(),
          local: new LocalProvider(),
        };
        
        // Set default and fallbacks
        this.defaultProvider = config?.provider || defaultConfig.provider;
        this.fallbackProviders = ['openai', 'anthropic', 'local'].filter(p => p !== this.defaultProvider);
      }
      
      async complete(options: AICompletionOptions): Promise<string> {
        const config = { ...defaultConfig, ...options.config };
        const provider = this.providers[config.provider || this.defaultProvider];
        
        try {
          return await provider.complete(options);
        } catch (error) {
          console.error(`Error with provider ${config.provider}:`, error);
          
          // Try fallback providers
          for (const fallbackProvider of this.fallbackProviders) {
            try {
              console.log(`Trying fallback provider: ${fallbackProvider}`);
              const fallbackOptions = { 
                ...options, 
                config: { ...options.config, provider: fallbackProvider } 
              };
              return await this.providers[fallbackProvider].complete(fallbackOptions);
            } catch (fallbackError) {
              console.error(`Error with fallback provider ${fallbackProvider}:`, fallbackError);
            }
          }
          
          throw new Error('All AI providers failed');
        }
      }
      
      async streamComplete(
        options: AICompletionOptions, 
        callback: (chunk: string) => void
      ): Promise<void> {
        const config = { ...defaultConfig, ...options.config };
        const provider = this.providers[config.provider || this.defaultProvider];
        
        try {
          await provider.streamComplete(options, callback);
        } catch (error) {
          console.error(`Error with provider ${config.provider}:`, error);
          
          // Try fallback providers
          for (const fallbackProvider of this.fallbackProviders) {
            try {
              console.log(`Trying fallback provider: ${fallbackProvider}`);
              const fallbackOptions = { 
                ...options, 
                config: { ...options.config, provider: fallbackProvider } 
              };
              await this.providers[fallbackProvider].streamComplete(fallbackOptions, callback);
              return;
            } catch (fallbackError) {
              console.error(`Error with fallback provider ${fallbackProvider}:`, fallbackError);
            }
          }
          
          throw new Error('All AI providers failed');
        }
      }
      
      async embedText(text: string, provider?: string): Promise<number[]> {
        const selectedProvider = provider || this.defaultProvider;
        
        try {
          return await this.providers[selectedProvider].embedText(text);
        } catch (error) {
          console.error(`Error with provider ${selectedProvider}:`, error);
          
          // Try fallback providers
          for (const fallbackProvider of this.fallbackProviders) {
            try {
              console.log(`Trying fallback provider: ${fallbackProvider}`);
              return await this.providers[fallbackProvider].embedText(text);
            } catch (fallbackError) {
              console.error(`Error with fallback provider ${fallbackProvider}:`, fallbackError);
            }
          }
          
          throw new Error('All AI providers failed to generate embeddings');
        }
      }
    }
    ```
    
  - [ ] Implement `/lib/ai/providers/openai.ts` provider
    ```typescript
    import OpenAI from 'openai';
    import { AICompletionOptions, AIProvider } from '../core/types';

    export class OpenAIProvider implements AIProvider {
      private client: OpenAI;
      
      constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
          console.warn('OpenAI API key not found. Some features may not work.');
        }
        
        this.client = new OpenAI({
          apiKey: apiKey || 'dummy-key',
        });
      }
      
      async complete(options: AICompletionOptions): Promise<string> {
        if (!process.env.OPENAI_API_KEY) {
          throw new Error('OpenAI API key not configured');
        }
        
        const { messages, config } = options;
        
        // Using the Responses API (newer approach)
        try {
          const response = await this.client.responses.create({
            model: config?.model || 'gpt-4o',
            input: messages.map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
            temperature: config?.temperature || 0.7,
            max_tokens: config?.maxTokens,
          });
          
          return response.output_text || '';
        } catch (error) {
          // Fallback to Chat Completions API
          const response = await this.client.chat.completions.create({
            model: config?.model || 'gpt-4o',
            messages: messages.map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
            temperature: config?.temperature || 0.7,
            max_tokens: config?.maxTokens,
            top_p: config?.topP,
            frequency_penalty: config?.frequencyPenalty,
            presence_penalty: config?.presencePenalty,
          });
          
          return response.choices[0].message.content || '';
        }
      }
      
      async streamComplete(
        options: AICompletionOptions, 
        callback: (chunk: string) => void
      ): Promise<void> {
        if (!process.env.OPENAI_API_KEY) {
          throw new Error('OpenAI API key not configured');
        }
        
        const { messages, config } = options;
        
        // Try Responses API first (newer approach)
        try {
          const stream = await this.client.responses.create({
            model: config?.model || 'gpt-4o',
            input: messages.map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
            temperature: config?.temperature || 0.7,
            max_tokens: config?.maxTokens,
            stream: true,
          });
          
          for await (const event of stream) {
            if (event.output_text_delta) {
              callback(event.output_text_delta);
            }
          }
        } catch (error) {
          // Fallback to Chat Completions API
          const stream = await this.client.chat.completions.create({
            model: config?.model || 'gpt-4o',
            messages: messages.map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
            temperature: config?.temperature || 0.7,
            max_tokens: config?.maxTokens,
            top_p: config?.topP,
            frequency_penalty: config?.frequencyPenalty,
            presence_penalty: config?.presencePenalty,
            stream: true,
          });
          
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              callback(content);
            }
          }
        }
      }
      
      async embedText(text: string): Promise<number[]> {
        if (!process.env.OPENAI_API_KEY) {
          throw new Error('OpenAI API key not configured');
        }
        
        const response = await this.client.embeddings.create({
          model: 'text-embedding-3-small',
          input: text,
        });
        
        return response.data[0].embedding;
      }
    }
    ```
    
  - [ ] Implement `/lib/ai/providers/anthropic.ts` provider
    ```typescript
    import Anthropic from '@anthropic-ai/sdk';
    import { AICompletionOptions, AIProvider } from '../core/types';

    export class AnthropicProvider implements AIProvider {
      private client: Anthropic;
      
      constructor() {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          console.warn('Anthropic API key not found. Some features may not work.');
        }
        
        this.client = new Anthropic({
          apiKey: apiKey || 'dummy-key',
        });
      }
      
      async complete(options: AICompletionOptions): Promise<string> {
        if (!process.env.ANTHROPIC_API_KEY) {
          throw new Error('Anthropic API key not configured');
        }
        
        const { messages, config } = options;
        
        // Convert to Anthropic format
        const anthropicMessages = messages.map(msg => {
          if (msg.role === 'system') {
            return { role: 'system', content: msg.content };
          } else if (msg.role === 'user') {
            return { role: 'user', content: msg.content };
          } else {
            return { role: 'assistant', content: msg.content };
          }
        });
        
        const response = await this.client.messages.create({
          model: config?.model || 'claude-3-5-sonnet-latest',
          messages: anthropicMessages,
          max_tokens: config?.maxTokens || 1000,
          temperature: config?.temperature || 0.7,
          top_p: config?.topP,
        });
        
        return response.content[0].text;
      }
      
      async streamComplete(
        options: AICompletionOptions, 
        callback: (chunk: string) => void
      ): Promise<void> {
        if (!process.env.ANTHROPIC_API_KEY) {
          throw new Error('Anthropic API key not configured');
        }
        
        const { messages, config } = options;
        
        // Convert to Anthropic format
        const anthropicMessages = messages.map(msg => {
          if (msg.role === 'system') {
            return { role: 'system', content: msg.content };
          } else if (msg.role === 'user') {
            return { role: 'user', content: msg.content };
          } else {
            return { role: 'assistant', content: msg.content };
          }
        });
        
        const stream = await this.client.messages.create({
          model: config?.model || 'claude-3-5-sonnet-latest',
          messages: anthropicMessages,
          max_tokens: config?.maxTokens || 1000,
          temperature: config?.temperature || 0.7,
          top_p: config?.topP,
          stream: true,
        });
        
        for await (const messageStreamEvent of stream) {
          if (messageStreamEvent.type === 'content_block_delta' && messageStreamEvent.delta.text) {
            callback(messageStreamEvent.delta.text);
          }
        }
      }
      
      async embedText(text: string): Promise<number[]> {
        throw new Error('Embedding not supported by Anthropic provider');
      }
    }
    ```
    
  - [ ] Create `/lib/ai/providers/local.ts` provider as fallback
    ```typescript
    import { AICompletionOptions, AIProvider } from '../core/types';

    export class LocalProvider implements AIProvider {
      constructor() {
        console.log('Local AI provider initialized as fallback');
      }
      
      async complete(options: AICompletionOptions): Promise<string> {
        console.log('Using local fallback provider');
        
        // Extract the last user message
        const lastUserMessage = [...options.messages].reverse()
          .find(msg => msg.role === 'user')?.content || '';
        
        // Simple fallback responses
        if (lastUserMessage.includes('hello') || lastUserMessage.includes('hi')) {
          return "Hello! I'm a simple fallback AI. The main AI service is currently unavailable.";
        }
        
        if (lastUserMessage.includes('help')) {
          return "I'm a fallback AI with limited capabilities. Please try again later when the main AI service is available.";
        }
        
        return "I'm sorry, but the AI service is currently unavailable. This is a fallback response. Please try again later.";
      }
      
      async streamComplete(
        options: AICompletionOptions, 
        callback: (chunk: string) => void
      ): Promise<void> {
        const response = await this.complete(options);
        
        // Simulate streaming by sending chunks of the response
        const chunks = response.split(' ');
        for (const chunk of chunks) {
          callback(chunk + ' ');
          // Add a small delay to simulate streaming
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      async embedText(text: string): Promise<number[]> {
        // Return a simple mock embedding (32-dimensional vector of random values)
        return Array.from({ length: 32 }, () => Math.random());
      }
    }
    ```
    
  - [ ] Create basic prompt management system in `/lib/ai/prompts/index.ts`
    ```typescript
    import { AIMessage } from '../core/types';

    export interface PromptTemplate {
      id: string;
      version: string;
      description: string;
      category: 'content' | 'marketing' | 'support' | 'analysis' | 'general';
      systemPrompt: string;
      userPrompt: string;
      exampleResponse?: string;
    }

    export interface PromptParams {
      [key: string]: string | number | boolean | object;
    }

    // Prompt template registry
    const promptTemplates: Record<string, PromptTemplate> = {
      'content-generation': {
        id: 'content-generation',
        version: '1.0.0',
        description: 'Generates creative content based on a topic',
        category: 'content',
        systemPrompt: 'You are a creative content writer who specializes in engaging, informative content.',
        userPrompt: 'Generate {{count}} creative ideas about {{topic}} in the style of {{style}}.',
        exampleResponse: '1. [Creative Idea 1]\n2. [Creative Idea 2]\n3. [Creative Idea 3]',
      },
      
      'marketing-copy': {
        id: 'marketing-copy',
        version: '1.0.0',
        description: 'Creates marketing copy for products or services',
        category: 'marketing',
        systemPrompt: 'You are an expert marketing copywriter who creates compelling, conversion-focused copy.',
        userPrompt: 'Write {{type}} copy for {{product}} targeting {{audience}}. Key benefits: {{benefits}}.',
        exampleResponse: '[Attention-grabbing headline]\n\n[Compelling introduction]\n\n[Feature/benefit section]\n\n[Call to action]',
      },
      
      'customer-support': {
        id: 'customer-support',
        version: '1.0.0',
        description: 'Generates helpful customer support responses',
        category: 'support',
        systemPrompt: 'You are a helpful, friendly customer support representative.',
        userPrompt: 'The customer has the following issue: {{issue}}. Our product is {{product}}. Provide a helpful response.',
        exampleResponse: 'I understand how frustrating it can be when [issue happens]. Here's how we can resolve this...',
      },
      
      'data-analysis': {
        id: 'data-analysis',
        version: '1.0.0',
        description: 'Analyzes data and provides insights',
        category: 'analysis',
        systemPrompt: 'You are a data analyst who provides clear, actionable insights from data.',
        userPrompt: 'Analyze the following data: {{data}}. Focus on trends related to {{focus}}.',
        exampleResponse: 'Based on the data provided, I've identified the following key insights:\n\n1. [Insight 1]\n2. [Insight 2]\n3. [Insight 3]',
      },
    };

    export class PromptManager {
      private templates: Record<string, PromptTemplate>;
      
      constructor(customTemplates?: Record<string, PromptTemplate>) {
        this.templates = { ...promptTemplates, ...customTemplates };
      }
      
      getTemplate(templateId: string): PromptTemplate {
        const template = this.templates[templateId];
        if (!template) {
          throw new Error(`Prompt template "${templateId}" not found`);
        }
        return template;
      }
      
      addTemplate(template: PromptTemplate): void {
        this.templates[template.id] = template;
      }
      
      updateTemplate(templateId: string, updates: Partial<PromptTemplate>): void {
        const template = this.getTemplate(templateId);
        this.templates[templateId] = { ...template, ...updates };
      }
      
      formatPrompt(templateId: string, params: PromptParams): AIMessage[] {
        const template = this.getTemplate(templateId);
        
        // Replace placeholders in system prompt
        let systemPrompt = template.systemPrompt;
        for (const [key, value] of Object.entries(params)) {
          systemPrompt = systemPrompt.replace(
            new RegExp(`{{${key}}}`, 'g'), 
            String(value)
          );
        }
        
        // Replace placeholders in user prompt
        let userPrompt = template.userPrompt;
        for (const [key, value] of Object.entries(params)) {
          userPrompt = userPrompt.replace(
            new RegExp(`{{${key}}}`, 'g'), 
            String(value)
          );
        }
        
        return [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ];
      }
      
      getAllTemplates(): PromptTemplate[] {
        return Object.values(this.templates);
      }
      
      getTemplatesByCategory(category: string): PromptTemplate[] {
        return Object.values(this.templates).filter(
          template => template.category === category
        );
      }
    }
    ```
    
  - [ ] Create `/lib/ai/hooks/useAI.ts` hook for React components
    ```typescript
    import { useState, useCallback } from 'react';
    import { AIService } from '../core/ai-service';
    import { PromptManager, PromptParams } from '../prompts';
    import { AIMessage, AIModelConfig } from '../core/types';

    interface UseAIOptions {
      defaultConfig?: Partial<AIModelConfig>;
    }

    export function useAI(options: UseAIOptions = {}) {
      const [isLoading, setIsLoading] = useState(false);
      const [error, setError] = useState<string | null>(null);
      const [result, setResult] = useState<string>('');
      const [streamingResult, setStreamingResult] = useState<string>('');
      
      // Initialize services
      const aiService = new AIService(options.defaultConfig);
      const promptManager = new PromptManager();
      
      const generateCompletion = useCallback(async (
        messages: AIMessage[],
        config?: Partial<AIModelConfig>
      ) => {
        setIsLoading(true);
        setError(null);
        
        try {
          const response = await aiService.complete({
            messages,
            config,
          });
          
          setResult(response);
          return response;
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
          setError(errorMessage);
          throw err;
        } finally {
          setIsLoading(false);
        }
      }, []);
      
      const generateStreamingCompletion = useCallback(async (
        messages: AIMessage[],
        config?: Partial<AIModelConfig>
      ) => {
        setIsLoading(true);
        setError(null);
        setStreamingResult('');
        
        try {
          await aiService.streamComplete(
            {
              messages,
              config,
            },
            (chunk) => {
              setStreamingResult(prev => prev + chunk);
            }
          );
          
          return streamingResult;
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
          setError(errorMessage);
          throw err;
        } finally {
          setIsLoading(false);
        }
      }, [streamingResult]);
      
      const generateFromTemplate = useCallback(async (
        templateId: string,
        params: PromptParams,
        config?: Partial<AIModelConfig>
      ) => {
        const messages = promptManager.formatPrompt(templateId, params);
        return generateCompletion(messages, config);
      }, [generateCompletion]);
      
      const generateStreamingFromTemplate = useCallback(async (
        templateId: string,
        params: PromptParams,
        config?: Partial<AIModelConfig>
      ) => {
        const messages = promptManager.formatPrompt(templateId, params);
        return generateStreamingCompletion(messages, config);
      }, [generateStreamingCompletion]);
      
      return {
        isLoading,
        error,
        result,
        streamingResult,
        generateCompletion,
        generateStreamingCompletion,
        generateFromTemplate,
        generateStreamingFromTemplate,
        promptManager,
      };
    }
    ```
    
  - [ ] Create new generic AI edge function template in `/supabase/functions/ai-service/index.ts`
    ```typescript
    import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
    import { corsHeaders } from '../_shared/cors.ts';
    import { AIService } from '../_shared/ai-service.ts';

    interface RequestBody {
      messages: Array<{ role: string; content: string }>;
      templateId?: string;
      templateParams?: Record<string, any>;
      config?: {
        provider?: string;
        model?: string;
        temperature?: number;
        maxTokens?: number;
      };
      stream?: boolean;
    }

    serve(async (req) => {
      // Handle CORS
      if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
      }
      
      try {
        const { messages, templateId, templateParams, config, stream } = await req.json() as RequestBody;
        
        // Initialize AI service
        const aiService = new AIService(config);
        
        if (stream) {
          // Set up streaming response
          const encoder = new TextEncoder();
          const stream = new TransformStream();
          const writer = stream.writable.getWriter();
          
          // Start processing in the background
          (async () => {
            try {
              if (templateId && templateParams) {
                // Use template-based generation
                // This would require implementing the prompt manager in Deno
                // For now, we'll just use the messages directly
                await aiService.streamComplete(
                  { messages, config },
                  async (chunk) => {
                    await writer.write(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
                  }
                );
              } else {
                // Use direct message-based generation
                await aiService.streamComplete(
                  { messages, config },
                  async (chunk) => {
                    await writer.write(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
                  }
                );
              }
              
              // Signal completion
              await writer.write(encoder.encode('data: [DONE]\n\n'));
              await writer.close();
            } catch (error) {
              // Handle errors during streaming
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              await writer.write(
                encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
              );
              await writer.close();
            }
          })();
          
          // Return the stream response
          return new Response(stream.readable, {
            headers: {
              ...corsHeaders,
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
          });
        } else {
          // Non-streaming response
          let result: string;
          
          if (templateId && templateParams) {
            // This would use the prompt manager in a real implementation
            // For now, we'll just use the messages directly
            result = await aiService.complete({ messages, config });
          } else {
            result = await aiService.complete({ messages, config });
          }
          
          return new Response(
            JSON.stringify({ result }),
            {
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
              },
            }
          );
        }
      } catch (error) {
        // Handle request errors
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        return new Response(
          JSON.stringify({ error: errorMessage }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }
    });
    ```
    
  - [ ] Create example usage in `/examples/ai-service-usage.ts`
    ```typescript
    import { AIService } from '../lib/ai/core/ai-service';
    import { PromptManager } from '../lib/ai/prompts';

    /**
     * Example 1: Basic completion with direct messages
     */
    async function basicCompletion() {
      const aiService = new AIService();
      
      const result = await aiService.complete({
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'What are the top 3 benefits of using TypeScript?' },
        ],
      });
      
      console.log('Basic Completion Result:');
      console.log(result);
    }

    /**
     * Example 2: Streaming completion with direct messages
     */
    async function streamingCompletion() {
      const aiService = new AIService();
      
      console.log('Streaming Completion Result:');
      await aiService.streamComplete(
        {
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Write a short poem about coding.' },
          ],
        },
        (chunk) => {
          // In a real application, you might append this to a state variable
          process.stdout.write(chunk);
        }
      );
      console.log('\n--- End of streaming response ---');
    }

    /**
     * Example 3: Using prompt templates
     */
    async function templateBasedCompletion() {
      const aiService = new AIService();
      const promptManager = new PromptManager();
      
      // Get formatted messages from a template
      const messages = promptManager.formatPrompt('content-generation', {
        count: 3,
        topic: 'artificial intelligence',
        style: 'educational',
      });
      
      const result = await aiService.complete({
        messages,
        config: {
          temperature: 0.8, // More creative
        },
      });
      
      console.log('Template-Based Completion Result:');
      console.log(result);
    }

    /**
     * Example 4: Using different providers
     */
    async function multiProviderExample() {
      // Using OpenAI
      const openaiService = new AIService({ provider: 'openai', model: 'gpt-4o' });
      const openaiResult = await openaiService.complete({
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Explain quantum computing in simple terms.' },
        ],
      });
      
      console.log('OpenAI Result:');
      console.log(openaiResult);
      
      // Using Anthropic
      const anthropicService = new AIService({ provider: 'anthropic', model: 'claude-3-opus-20240229' });
      const anthropicResult = await anthropicService.complete({
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Explain quantum computing in simple terms.' },
        ],
      });
      
      console.log('Anthropic Result:');
      console.log(anthropicResult);
    }

    /**
     * Example 5: Error handling and fallbacks
     */
    async function errorHandlingExample() {
      // Intentionally using an invalid configuration to trigger fallbacks
      const aiService = new AIService({ 
        provider: 'invalid-provider', // This will fail and trigger fallbacks
      });
      
      try {
        const result = await aiService.complete({
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Hello, how are you?' },
          ],
        });
        
        console.log('Result after fallbacks:');
        console.log(result);
      } catch (error) {
        console.error('All providers failed:', error);
      }
    }

    // Run the examples
    async function runExamples() {
      console.log('=== AI Service Usage Examples ===\n');
      
      try {
        await basicCompletion();
        console.log('\n---\n');
        
        await streamingCompletion();
        console.log('\n---\n');
        
        await templateBasedCompletion();
        console.log('\n---\n');
        
        await multiProviderExample();
        console.log('\n---\n');
        
        await errorHandlingExample();
      } catch (error) {
        console.error('Error running examples:', error);
      }
    }

    // Uncomment to run the examples
    // runExamples();

    export {
      basicCompletion,
      streamingCompletion,
      templateBasedCompletion,
      multiProviderExample,
      errorHandlingExample,
    };
    ```

- [x] **Email Service Layer**
  - [x] Install required packages (resend, react-email, @react-email/components)
  - [x] Create `/lib/email/email-service.ts` with provider-agnostic interface ✅
  - [x] Create `/lib/email/templates/index.ts` for template management ✅
  - [x] Implement basic email templates:
    - [x] `/lib/email/templates/components/WelcomeEmail.tsx`
    - [x] `/lib/email/templates/components/PasswordResetEmail.tsx`
    - [x] `/lib/email/templates/components/VerificationEmail.tsx`
    - [x] `/lib/email/templates/components/InvitationEmail.tsx`
  - [x] Create `/lib/auth/auth-emails.ts` to integrate with auth system
  - [x] Update auth hooks to use the email service
  - [x] Create setup scripts:
    - [x] `/scripts/setup-email.ts` - Interactive email configuration ✅
    - [x] `/scripts/test-email.ts` - Email testing utility ✅
  - [x] Update documentation in ai_docs/ and tutorial/ to include email setup ✅

- [x] **Supabase Email Integration**
  - [x] Enhance `/scripts/setup-email.ts` to guide Supabase SMTP configuration
  - [x] Update the email setup script to provide Resend SMTP credentials
  - [x] Add instructions for configuring Supabase auth email templates
  - [x] Create documentation on dual email approach:
    - Supabase handles auth emails via Resend SMTP
    - Custom email service handles transactional emails
  - [x] Update tutorial documentation:
    - [x] Update `/tutorial/7_EMAIL_INTEGRATION.md` with Supabase SMTP setup
    - [x] Add section on customizing Supabase email templates
  - [x] Update AI documentation:
    - [x] Enhance `/ai_docs/email-configuration.md` with Supabase integration
    - [x] Update `/ai_docs/email-service-guide.md` to clarify the dual approach
  - [x] Create example for sending custom transactional emails

- [ ] **Auth & Payment Services**
  - [ ] Update auth services to be template-ready
  - [ ] Enhance payment services for tiered pricing
  - [ ] Create abstraction layers for external services
  - [ ] Improve subscription management hooks

## Phase 3: Marketing & Analytics Essentials

- [ ] **Marketing Components**
  - [ ] Create `/components/marketing/HeroSection.tsx`
  - [ ] Create `/components/marketing/FeatureSection.tsx`
  - [ ] Create `/components/marketing/PricingSection.tsx`
  - [ ] Implement basic welcome email template

- [ ] **Analytics Components**
  - [ ] Create dashboard layout component
  - [ ] Implement conversion tracking
  - [ ] Add revenue metrics components
  - [ ] Create basic user engagement tracking

## Phase 4: Customization Framework

- [ ] **Theme & Branding**
  - [ ] Create `/lib/config/theme.ts` for theme configuration
  - [ ] Implement theme provider context
  - [ ] Add configuration for logo and brand assets

- [ ] **Legal & Configuration**
  - [ ] Create basic legal document templates:
    - `/templates/legal/PrivacyPolicy.md`
    - `/templates/legal/TermsOfService.md`
  - [ ] Add feature flag system for enabling/disabling features

## Phase 5: Developer Experience

- [x] **Documentation**
  - [x] Create architecture overview documentation ✅
  - [ ] Add getting started guide
  - [x] Develop GLOSSARY.md for quick reference ✅
  - [x] Create email configuration documentation ✅
  - [ ] Update tutorial files with email setup instructions

- [x] **Developer Tools**
  - [ ] Create setup script for initial project configuration
  - [ ] Add deployment automation script
  - [x] Create customization guide with examples ✅
  - [x] Add email testing and configuration scripts ✅

## Testing & Validation

- [ ] **Core Testing**
  - [ ] Create template-agnostic test utilities
  - [ ] Implement tests for core services (AI, Auth, Email, Storage, Payments)
  - [ ] Test with different product types as examples

- [ ] **Quality Assurance**
  - [ ] Verify performance metrics
  - [ ] Test accessibility compliance
  - [ ] Perform security audit
  - [x] Test email deliverability and template rendering ✅
