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
    exampleResponse: 'I understand how frustrating it can be when [issue happens]. Here\'s how we can resolve this...',
  },
  
  'data-analysis': {
    id: 'data-analysis',
    version: '1.0.0',
    description: 'Analyzes data and provides insights',
    category: 'analysis',
    systemPrompt: 'You are a data analyst who provides clear, actionable insights from data.',
    userPrompt: 'Analyze the following data: {{data}}. Focus on trends related to {{focus}}.',
    exampleResponse: 'Based on the data provided, I\'ve identified the following key insights:\n\n1. [Insight 1]\n2. [Insight 2]\n3. [Insight 3]',
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
