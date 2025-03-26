import Anthropic from '@anthropic-ai/sdk';
import { AICompletionOptions, AIProvider } from '../core/types';

export class AnthropicProvider implements AIProvider {
  private client: Anthropic;
  
  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
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
    const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
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
      model: config?.model || 'claude-3-7-sonnet-latest',
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
    const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
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
      model: config?.model || 'claude-3-7-sonnet-latest',
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
