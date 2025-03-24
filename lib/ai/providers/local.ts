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
