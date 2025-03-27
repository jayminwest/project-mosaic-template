# Prompt Management Guide

This guide explains how to use the prompt management system in Project Mosaic to create, manage, and use prompt templates for AI interactions.

## Overview

The prompt management system provides a way to:

1. Define reusable prompt templates with placeholders
2. Version and categorize prompts
3. Format prompts with dynamic parameters
4. Maintain a consistent approach to AI interactions

## Core Concepts

### Prompt Template

A prompt template defines the structure of a prompt with placeholders for dynamic content:

```typescript
interface PromptTemplate {
  id: string;
  version: string;
  description: string;
  category: 'content' | 'marketing' | 'support' | 'analysis' | 'general';
  systemPrompt: string;
  userPrompt: string;
  exampleResponse?: string;
}
```

### Prompt Parameters

Parameters used to fill in the placeholders in a prompt template:

```typescript
interface PromptParams {
  [key: string]: string | number | boolean | object;
}
```

## PromptManager Class

The `PromptManager` class provides methods for managing and using prompt templates.

### Constructor

```typescript
constructor(customTemplates?: Record<string, PromptTemplate>)
```

Creates a new PromptManager instance with optional custom templates.

### Methods

#### getTemplate

```typescript
getTemplate(templateId: string): PromptTemplate
```

Gets a prompt template by its ID.

**Parameters:**
- `templateId`: The ID of the template to retrieve

**Returns:**
- The prompt template

**Example:**
```typescript
const promptManager = new PromptManager();
const template = promptManager.getTemplate('content-generation');
```

#### addTemplate

```typescript
addTemplate(template: PromptTemplate): void
```

Adds a new prompt template.

**Parameters:**
- `template`: The prompt template to add

**Example:**
```typescript
const promptManager = new PromptManager();
promptManager.addTemplate({
  id: 'product-description',
  version: '1.0.0',
  description: 'Generates product descriptions',
  category: 'marketing',
  systemPrompt: 'You are a marketing copywriter who creates compelling product descriptions.',
  userPrompt: 'Create a product description for {{productName}} that highlights {{features}}.',
});
```

#### updateTemplate

```typescript
updateTemplate(templateId: string, updates: Partial<PromptTemplate>): void
```

Updates an existing prompt template.

**Parameters:**
- `templateId`: The ID of the template to update
- `updates`: The partial template with updates

**Example:**
```typescript
const promptManager = new PromptManager();
promptManager.updateTemplate('content-generation', {
  version: '1.0.1',
  systemPrompt: 'You are a creative content writer who specializes in engaging, informative content with a touch of humor.',
});
```

#### formatPrompt

```typescript
formatPrompt(templateId: string, params: PromptParams): AIMessage[]
```

Formats a prompt template with the provided parameters.

**Parameters:**
- `templateId`: The ID of the template to format
- `params`: The parameters to fill in the template

**Returns:**
- An array of AIMessage objects ready to be sent to the AI service

**Example:**
```typescript
const promptManager = new PromptManager();
const messages = promptManager.formatPrompt('content-generation', {
  count: 5,
  topic: 'artificial intelligence',
  style: 'informative'
});
```

#### getAllTemplates

```typescript
getAllTemplates(): PromptTemplate[]
```

Gets all prompt templates.

**Returns:**
- An array of all prompt templates

**Example:**
```typescript
const promptManager = new PromptManager();
const allTemplates = promptManager.getAllTemplates();
```

#### getTemplatesByCategory

```typescript
getTemplatesByCategory(category: string): PromptTemplate[]
```

Gets all prompt templates in a specific category.

**Parameters:**
- `category`: The category to filter by

**Returns:**
- An array of prompt templates in the specified category

**Example:**
```typescript
const promptManager = new PromptManager();
const marketingTemplates = promptManager.getTemplatesByCategory('marketing');
```

## Built-in Templates

Project Mosaic includes several built-in prompt templates:

### content-generation

Generates creative content based on a topic.

**Parameters:**
- `count`: Number of ideas to generate
- `topic`: The topic to generate content about
- `style`: The style of the content (informative, humorous, etc.)

**Example:**
```typescript
const { generateFromTemplate } = useAI();
const content = await generateFromTemplate('content-generation', {
  count: 5,
  topic: 'artificial intelligence',
  style: 'informative'
});
```

### marketing-copy

Creates marketing copy for products or services.

**Parameters:**
- `type`: Type of copy (landing page, email, ad, etc.)
- `product`: The product or service
- `audience`: The target audience
- `benefits`: Key benefits to highlight

**Example:**
```typescript
const { generateFromTemplate } = useAI();
const copy = await generateFromTemplate('marketing-copy', {
  type: 'landing page',
  product: 'AI Writing Assistant',
  audience: 'content creators',
  benefits: 'saves time, improves quality, reduces errors'
});
```

### customer-support

Generates helpful customer support responses.

**Parameters:**
- `issue`: The customer's issue
- `product`: The product or service

**Example:**
```typescript
const { generateFromTemplate } = useAI();
const response = await generateFromTemplate('customer-support', {
  issue: 'I can't log into my account',
  product: 'Project Mosaic'
});
```

### data-analysis

Analyzes data and provides insights.

**Parameters:**
- `data`: The data to analyze
- `focus`: What to focus on in the analysis

**Example:**
```typescript
const { generateFromTemplate } = useAI();
const analysis = await generateFromTemplate('data-analysis', {
  data: JSON.stringify(userData),
  focus: 'usage patterns'
});
```

## Creating Custom Templates

You can create custom templates for your specific use cases:

```typescript
import { PromptManager } from '@/lib/ai/prompts';

// Create a new prompt manager or get the existing one
const promptManager = new PromptManager();

// Add a new template
promptManager.addTemplate({
  id: 'product-description',
  version: '1.0.0',
  description: 'Generates product descriptions',
  category: 'marketing',
  systemPrompt: 'You are a marketing copywriter who creates compelling product descriptions.',
  userPrompt: 'Create a product description for {{productName}} that highlights {{features}}.',
});

// Use the template
const messages = promptManager.formatPrompt('product-description', {
  productName: 'AI Writing Assistant',
  features: 'grammar correction, style suggestions, content generation'
});
```

## Integration with useAI Hook

The `useAI` hook provides methods for using prompt templates:

```typescript
import { useAI } from '@/lib/ai/hooks/useAI';

function TemplateExample() {
  const { generateFromTemplate, isLoading } = useAI();
  
  const handleGenerate = async () => {
    const response = await generateFromTemplate(
      'content-generation',
      {
        count: 5,
        topic: 'artificial intelligence',
        style: 'informative'
      }
    );
    
    console.log('Generated content:', response);
  };
  
  return (
    <button onClick={handleGenerate} disabled={isLoading}>
      Generate Content
    </button>
  );
}
```

## Best Practices

1. **Version Your Templates**: Use semantic versioning for your templates to track changes
2. **Use Descriptive IDs**: Choose template IDs that clearly indicate their purpose
3. **Provide Example Responses**: Include example responses to help understand the expected output
4. **Categorize Templates**: Use categories to organize templates by their purpose
5. **Keep System Prompts Concise**: System prompts should be clear and focused
6. **Test Templates Thoroughly**: Verify that templates produce the expected results with different parameters
7. **Document Parameters**: Clearly document the parameters each template expects
8. **Use Consistent Formatting**: Maintain a consistent style for placeholders (e.g., `{{paramName}}`)
9. **Handle Missing Parameters**: Provide default values or clear error messages for missing parameters
10. **Optimize for Token Usage**: Keep prompts efficient to minimize token consumption
