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
