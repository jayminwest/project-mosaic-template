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
      dangerouslyAllowBrowser: true, // Enable browser usage - ensure your API key is properly secured
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
