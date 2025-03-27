# Project Mosaic Customization Guide

This document provides comprehensive guidance on customizing the Project Mosaic template for different product types. It covers key customization points, configuration options, and best practices for adapting the template to your specific micro-SaaS product.

## Core Customization Points

### 1. Product Configuration

The configuration system in `lib/config/` provides a comprehensive way to customize your product:

```typescript
// Example from lib/config/default-config.ts
export const productConfig: ProductConfig = {
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

You can use the interactive setup script to configure your product:

```bash
npm run init-config
```

Or use the quick setup by modifying `lib/config/quick-setup.ts` and running:

```bash
npm run quick-setup
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

The theme configuration in `lib/config/theme.ts` allows you to customize your product's branding:

```typescript
export const themeConfig: ThemeConfig = {
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

You can access theme settings in your components using the `useConfig` hook:

```typescript
import { useConfig } from '@/lib/config/useConfig';

function MyComponent() {
  const { theme } = useConfig();
  
  return (
    <div style={{ color: theme.colors.primary.light }}>
      Themed content
    </div>
  );
}
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
   - Run `npm run init-config` for interactive setup
   - Or modify `lib/config/quick-setup.ts` and run `npm run quick-setup`
   - Configure product details, resource limits, and feature flags

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

1. Define prompts in `lib/ai/prompts/index.ts`:
   ```typescript
   // Create a prompt manager instance
   const promptManager = new PromptManager();
   
   // Add a new prompt template
   promptManager.addTemplate({
     id: 'product-description',
     version: '1.0.0',
     description: 'Generates product descriptions',
     category: 'marketing',
     systemPrompt: 'You are a marketing copywriter who creates compelling product descriptions.',
     userPrompt: 'Create a product description for {{productName}} that highlights {{features}}.',
   });
   ```

2. Create AI-enhanced functions using the useAI hook:
   ```typescript
   import { useAI } from '@/lib/ai/hooks/useAI';
   
   // In your component or custom hook
   function useProductAI() {
     const { 
       generateFromTemplate, 
       generateCompletion,
       isLoading, 
       error 
     } = useAI();
     
     const generateProductDescription = async (productName: string, features: string[]) => {
       try {
         // Using a template
         return await generateFromTemplate('product-description', {
           productName,
           features: features.join(', ')
         });
         
         // Or using direct messages
         /*
         return await generateCompletion([
           { role: 'system', content: 'You are a marketing copywriter who creates compelling product descriptions.' },
           { role: 'user', content: `Create a product description for ${productName} that highlights ${features.join(', ')}.` }
         ]);
         */
       } catch (error) {
         console.error('AI generation failed:', error);
         return 'Failed to generate product description. Please try again later.';
       }
     };
     
     return {
       generateProductDescription,
       isLoading,
       error
     };
   }
   ```

3. Implement UI components that use these functions:
   ```tsx
   import { useState } from 'react';
   import { Button } from '@/components/ui/button';
   
   // In your React component
   function ProductDescriptionGenerator() {
     const [productName, setProductName] = useState('');
     const [features, setFeatures] = useState<string[]>([]);
     const [description, setDescription] = useState('');
     const { generateProductDescription, isLoading } = useProductAI();
     
     const handleGenerate = async () => {
       const result = await generateProductDescription(productName, features);
       setDescription(result);
     };
     
     return (
       <div>
         {/* Form inputs */}
         <Button onClick={handleGenerate} disabled={isLoading}>
           {isLoading ? 'Generating...' : 'Generate Description'}
         </Button>
         {description && <div className="mt-4">{description}</div>}
       </div>
     );
   }
   ```

4. Track AI usage for analytics and limits:
   ```typescript
   // After generating content, track the usage
   const trackAIUsage = async (prompt: string, response: string, model: string) => {
     try {
       await supabase.from('ai_interactions').insert({
         user_id: userId,
         prompt_length: prompt.length,
         response_length: response.length,
         model_used: model,
         created_at: new Date().toISOString()
       });
     } catch (error) {
       console.error('Failed to track AI usage:', error);
     }
   };
   
   // Use it after generating content
   const response = await generateProductDescription(productName, features);
   await trackAIUsage(
     `Create a product description for ${productName}`, 
     response, 
     'gpt-4o'
   );
   ```

5. Implement usage limits based on subscription plan:
   ```typescript
   import { getResourceLimit } from '@/lib/config/plan-access';
   import { useFeatureAccess } from '@/hooks/useFeatureAccess';
   
   function AIFeature() {
     const { hasAccess } = useFeatureAccess('advancedAI');
     const aiLimit = getResourceLimit(user.subscription_plan || 'free', 'AIInteractions');
     const currentUsage = user.usage_metrics?.ai_interactions_count || 0;
     
     if (!hasAccess) {
       return <UpgradePrompt feature="Advanced AI" />;
     }
     
     if (currentUsage >= aiLimit) {
       return (
         <FeatureLimit
           title="AI Usage Limit Reached"
           description="You've reached your monthly AI usage limit."
           current={currentUsage}
           limit={aiLimit}
           showUpgradeLink
         />
       );
     }
     
     return <AIComponent />;
   }
   ```

### Customizing Email Templates

1. Create new React Email templates in `lib/email/templates/components/`
2. Register templates in `lib/email/templates/index.ts`
3. Create helper functions in your service to send emails
4. Update environment variables with your Resend API key

### Customizing Subscription Tiers

1. Update subscription plans in `lib/config/subscription.ts`:
   ```typescript
   export const subscriptionPlans: SubscriptionPlan[] = [
     {
       id: "free",
       name: "Free",
       description: "Basic features for personal use",
       priceId: "", // No price ID for free plan
       price: 0,
       currency: "USD",
       interval: "month",
       planType: "free",
       features: [
         "Up to 10 resources",
         "5MB storage",
         "Basic features"
       ]
     },
     {
       id: "premium",
       name: "Premium",
       description: "Advanced features for professionals",
       priceId: "price_1234567890", // Will be updated by setup script
       price: 9.99,
       currency: "USD",
       interval: "month",
       planType: "premium",
       features: [
         "Up to 100 resources",
         "50MB storage",
         "Advanced features",
         "Priority support"
       ]
     }
   ];
   ```

2. Create Stripe products and prices using the setup script:
   ```bash
   npm run setup-subscription-plans
   ```
   
   This script will:
   - Create products in Stripe with proper metadata
   - Set up pricing tiers
   - Configure features and resource limits
   - Update your local configuration with Stripe price IDs

3. Update the subscription management UI:
   - Use the `FeatureLimit` component to show resource usage:
     ```tsx
     <FeatureLimit
       title="AI Usage"
       description="Monthly AI interactions"
       current={metrics?.ai_interactions_count || 0}
       limit={getResourceLimit(user?.subscription_plan || 'free', 'AIInteractions')}
       showUpgradeLink={user?.subscription_plan === 'free'}
     />
     ```
   
   - Add `PremiumBadge` to premium features:
     ```tsx
     <div className="flex items-center">
       Advanced Analytics
       <PremiumBadge type="premium" className="ml-2" />
     </div>
     ```
   
   - Implement `UpgradePrompt` for free users:
     ```tsx
     {!hasAccess && (
       <UpgradePrompt
         feature="Advanced AI"
         description="Upgrade to Premium to access advanced AI features"
       />
     )}
     ```

4. Use the plan-access helpers for feature access control:
   ```typescript
   import { hasFeatureAccess, getResourceLimit } from '@/lib/config/plan-access';
   
   // Check if user has access to a feature
   const canAccessAdvancedAI = hasFeatureAccess(
     user?.subscription_plan || 'free',
     'advanced_ai',
     user?.cancellation_date
   );
   
   // Get resource limit based on plan
   const aiLimit = getResourceLimit(user?.subscription_plan || 'free', 'AIInteractions');
   
   // Check if user is in grace period after cancellation
   const inGracePeriod = isInGracePeriod(user?.cancellation_date);
   
   // Get remaining days in grace period
   const remainingDays = getRemainingGraceDays(user?.cancellation_date);
   ```

5. Use the `useFeatureAccess` hook in your components:
   ```tsx
   import { useFeatureAccess } from '@/hooks/useFeatureAccess';
   
   function PremiumFeature() {
     const { hasAccess, isLoading } = useFeatureAccess('advancedAI');
     
     if (isLoading) return <LoadingSkeleton />;
     
     return (
       <div>
         {hasAccess ? (
           <AdvancedFeature />
         ) : (
           <UpgradePrompt feature="Advanced AI" />
         )}
       </div>
     );
   }
   ```

6. Handle subscription cancellation and grace period:
   ```tsx
   import { isInGracePeriod, getGracePeriodEndDate } from '@/lib/config/plan-access';
   
   function SubscriptionStatus() {
     const inGracePeriod = isInGracePeriod(user?.cancellation_date);
     const endDate = getGracePeriodEndDate(user?.cancellation_date);
     
     return (
       <div>
         {inGracePeriod && (
           <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
             <h3 className="font-medium">Subscription Cancelled</h3>
             <p>
               Your premium access will end on {endDate}. 
               You can reactivate your subscription before this date to avoid any interruption.
             </p>
             <Button onClick={handleReactivate}>Reactivate Subscription</Button>
           </div>
         )}
       </div>
     );
   }
   ```

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
