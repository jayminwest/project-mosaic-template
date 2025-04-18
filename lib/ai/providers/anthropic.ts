import Anthropic from '@anthropic-ai/sdk';
import { AICompletionOptions, AIProvider } from '../core/types';

export class AnthropicProvider implements AIProvider {
  private client: Anthropic;
  
  constructor() {
    // Check for API key in both browser and server environments
    const apiKey = typeof window !== 'undefined' 
      ? process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY 
      : process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
      
    if (!apiKey) {
      console.warn('Anthropic API key not found. Some features may not work.');
    } else {
      console.log('Anthropic API key found, initializing client');
    }
    
    this.client = new Anthropic({
      apiKey: apiKey || 'dummy-key',
      dangerouslyAllowBrowser: true, // Enable browser usage - ensure your API key is properly secured
    });
  }
  
  async complete(options: AICompletionOptions): Promise<string> {
    // Check for API key in both browser and server environments
    const apiKey = typeof window !== 'undefined' 
      ? process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY 
      : process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
      
    if (!apiKey) {
      throw new Error('Anthropic API key not configured');
    }
    
    const { messages, config } = options;
    
    // Extract system message if present
    const systemMessage = messages.find(msg => msg.role === 'system')?.content || '';
    
    // Filter out system messages and convert to Anthropic format
    const anthropicMessages = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => {
        if (msg.role === 'user') {
          return { role: 'user', content: msg.content };
        } else {
          return { role: 'assistant', content: msg.content };
        }
      });
    
    const response = await this.client.messages.create({
      model: config?.model || 'claude-3-7-sonnet-latest',
      system: systemMessage, // Pass system message as a top-level parameter
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
    // Check for API key in both browser and server environments
    const apiKey = typeof window !== 'undefined' 
      ? process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY 
      : process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
      
    if (!apiKey) {
      throw new Error('Anthropic API key not configured');
    }
    
    const { messages, config } = options;
    
    // Extract system message if present
    const systemMessage = messages.find(msg => msg.role === 'system')?.content || '';
    
    // Filter out system messages and convert to Anthropic format
    const anthropicMessages = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => {
        if (msg.role === 'user') {
          return { role: 'user', content: msg.content };
        } else {
          return { role: 'assistant', content: msg.content };
        }
      });
    
    const stream = await this.client.messages.create({
      model: config?.model || 'claude-3-7-sonnet-latest',
      system: systemMessage, // Pass system message as a top-level parameter
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
