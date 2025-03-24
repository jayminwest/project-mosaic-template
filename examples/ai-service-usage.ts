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
