# Project Mosaic Customization Guide

This document provides comprehensive guidance on customizing the Project Mosaic template for different product types. It covers key customization points, configuration options, and best practices for adapting the template to your specific micro-SaaS product.

## Core Customization Points

### 1. Product Configuration

The central configuration file at `lib/config/index.ts` controls product-specific settings:

```typescript
// Example configuration
export const productConfig = {
  name: "Your Product Name",
  description: "A brief description of your product",
  slug: "your-product", // Used in URLs and as prefix for storage
  limits: {
    free: {
      resourceLimit: 10,
      storageLimit: 5, // MB
    },
    premium: {
      resourceLimit: 100,
      storageLimit: 50, // MB
    }
  },
  features: {
    enableAI: true,
    enableStorage: true,
    enableSharing: false,
  }
};
```

### 2. Database Schema

Customize the database schema in `supabase/migrations/` by adding product-specific tables:

```sql
-- Example product-specific table
CREATE TABLE public.content_items (
  item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  status TEXT DEFAULT 'draft',
  scheduled_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

-- Users can read their own content
CREATE POLICY "Users can read their own content" 
  ON public.content_items FOR SELECT 
  USING (auth.uid() = user_id);

-- Similar policies for INSERT, UPDATE, DELETE
```

### 3. Theme Customization

Modify the theme in `lib/config/theme.ts` to match your product's branding:

```typescript
export const themeConfig = {
  colors: {
    primary: {
      light: "#4f46e5", // Indigo
      dark: "#818cf8",
    },
    secondary: {
      light: "#0ea5e9", // Sky
      dark: "#38bdf8",
    },
    // Add other color variables
  },
  fonts: {
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif",
  },
  borderRadius: "0.5rem",
  // Other theme variables
};
```

### 4. AI Prompts

Customize AI prompts in `lib/ai/prompts/index.ts` for your product's specific use cases:

```typescript
export const prompts = {
  generateContent: (topic: string) => `
    Generate 5 content ideas related to "${topic}".
    For each idea, provide a title and a brief description.
    Format as a bulleted list.
  `,
  
  improveContent: (content: string) => `
    Improve the following content by making it more engaging, clear, and professional:
    
    ${content}
  `,
  
  // Add other product-specific prompts
};
```

## Product-Specific Customizations

### Content Calendar Product

```typescript
// hooks/useContentCalendar.ts
export function useContentCalendar() {
  // State and functions for content calendar
  
  const createContentItem = async (title, content, scheduledDate) => {
    // Implementation
  };
  
  const generateContentIdeas = async (topic) => {
    // AI integration
  };
  
  // Other functions
  
  return {
    // Return functions and state
  };
}
```

### Marketing Tool Product

```typescript
// hooks/useMarketingTool.ts
export function useMarketingTool() {
  // State and functions for marketing tool
  
  const createCampaign = async (name, audience, budget) => {
    // Implementation
  };
  
  const generateAdCopy = async (product, targetAudience) => {
    // AI integration
  };
  
  // Other functions
  
  return {
    // Return functions and state
  };
}
```

## Customization Process

Follow this step-by-step process to customize the template:

1. **Define Product Requirements**
   - Identify core functionality
   - Determine subscription tiers and limits
   - List AI integration points

2. **Configure Product Settings**
   - Update `lib/config/index.ts` with product details
   - Set appropriate resource limits
   - Enable/disable features

3. **Create Database Schema**
   - Design tables for product-specific data
   - Implement RLS policies
   - Add triggers for usage tracking

4. **Implement Product Service**
   - Create a custom hook for product functionality
   - Implement CRUD operations
   - Add AI-enhanced features

5. **Customize UI Components**
   - Update marketing components with product details
   - Create product-specific UI components
   - Implement dashboard views

6. **Configure Subscription Tiers**
   - Set up Stripe products and prices
   - Define tier features and limits
   - Update subscription management UI

7. **Test and Refine**
   - Verify all functionality works
   - Test subscription limits
   - Optimize AI prompts

## Common Customization Patterns

### Adding a New Resource Type

1. Create a database table for the resource
2. Add RLS policies for security
3. Create a service hook for CRUD operations
4. Implement UI components for the resource
5. Add usage tracking for the resource

### Implementing AI Features

1. Define prompts in `lib/ai/prompts/index.ts`
2. Create AI-enhanced functions in your product service
3. Implement UI components that use these functions
4. Add fallback mechanisms for when AI is unavailable

### Customizing Email Templates

1. Create new React Email templates in `lib/email/templates/components/`
2. Register templates in `lib/email/templates/index.ts`
3. Create helper functions in your service to send emails
4. Update environment variables with your Resend API key

### Customizing Subscription Tiers

1. Update `productConfig.limits` with tier-specific limits
2. Create Stripe products and prices
3. Update the subscription management UI
4. Implement tier-specific feature flags

## Best Practices

1. **Keep Configuration Centralized**
   - Use the config files for all customizable values
   - Avoid hardcoding product-specific values

2. **Follow the Existing Patterns**
   - Maintain consistent file and function naming
   - Use the established hook patterns

3. **Leverage AI Capabilities**
   - Identify opportunities for AI enhancement
   - Use the provider-agnostic AI service

4. **Implement Progressive Enhancement**
   - Ensure core functionality works without JavaScript
   - Add enhanced features for modern browsers

5. **Maintain Security**
   - Always implement RLS policies for new tables
   - Validate all user input

6. **Test Thoroughly**
   - Create tests for all product-specific functionality
   - Test with different subscription tiers

7. **Email Communication**
   - Use React Email templates for consistent branding
   - Test email deliverability across different clients
   - Implement proper email verification flows

By following this guide, you can quickly adapt the Project Mosaic template for different product types while maintaining a consistent architecture and leveraging the shared infrastructure.
