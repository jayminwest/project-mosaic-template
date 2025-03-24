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
