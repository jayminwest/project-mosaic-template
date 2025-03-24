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
