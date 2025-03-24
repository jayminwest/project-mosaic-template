# Project Mosaic Implementation Plan

This document outlines the step-by-step implementation plan for transforming the Task App into a template for Project Mosaic.

## Phase 1: Template Cleanup & Core Structure

- [x] **Remove Task-Specific Components**
  - [x] Clean up Supabase migration files:
    - `/supabase/migrations/1_init_tasks.sql`
    - `/supabase/migrations/5_init_task_limit_triggers.sql`
    - `/supabase/migrations/6_init_account_tier_triggers.sql`
  - [x] Remove task-specific edge functions:
    - `/supabase/functions/create-task-with-ai/index.ts`
  - [x] Remove task-specific components, pages, hooks, and types:
    - Components: `CreateTaskForm.tsx`, `TaskList.tsx`, `TaskRow.tsx`
    - Pages: `/app/task/page.tsx`, `/app/dashboard/page.tsx`
    - Hooks: `/hooks/useTaskManager.ts`
    - Types: `/types/taskManager.ts`
    - Tests: `1_task_crud.test.ts`, `5_task_limits.test.ts`
    - Utilities: `/lib/labels.ts`
  - [x] Standardize test file naming with proper sequence (01_core, 02_auth, etc.)
  - [x] Clean up tutorial files specific to the task app
  - [x] Standardize micro-SaaS terminology across documentation

- [x] **Database Schema Restructuring**
  - [x] Combine core Supabase migrations into a single initialization file
  - [x] Update database schema to be more generic and reusable
  - [x] Update types to match the exact database structure
  - [x] Refine subscription plan structure for better extensibility

- [x] **Core Project Structure**
  - [x] Create core directories for the new architecture:
    - `/lib/ai` - AI service abstraction ✅
    - `/lib/config` - Configuration system
    - `/lib/email` - Email service system ✅
    - `/components/marketing` - Marketing components
    - `/components/analytics` - Analytics components
  - [x] Set up configuration system for project customization
  - The configuration system is now fully implemented with the following structure:
    ```
    /lib/config/
    ├── types.ts           # TypeScript interfaces for configuration
    ├── index.ts           # Main exports and helper functions
    ├── default-config.ts  # Product-specific settings
    ├── theme.ts           # Theme customization
    ├── subscription.ts    # Subscription plan definitions
    ├── features.ts        # Feature flags
    ├── environment.ts     # Environment variable validation
    └── useConfig.ts       # React hook for accessing configuration
    ```
  - [x] Update environment variable structure with better documentation
  - [ ] Create placeholder dashboard page

## Phase 2: Essential Service Layers

- [x] **AI Service Layer**
  - [x] Create `/lib/ai/core/types.ts` with base interfaces
  - [x] Create `/lib/ai/core/ai-service.ts` with provider-agnostic interface
  - [x] Implement `/lib/ai/providers/openai.ts` provider
  - [x] Implement `/lib/ai/providers/anthropic.ts` provider
  - [x] Create `/lib/ai/providers/local.ts` provider as fallback
  - [x] Create basic prompt management system in `/lib/ai/prompts/index.ts`
  - [x] Create `/lib/ai/hooks/useAI.ts` hook for React components
  - [x] Create new generic AI edge function template in `/supabase/functions/ai-service/index.ts`
  - [x] Create example usage in `/examples/ai-service-usage.ts`
  - [x] Fix dependency conflicts between React versions and AI SDKs

- [x] **Configuration System**
  - [x] Create `/lib/config/types.ts` with configuration interfaces
    ```typescript
    // /lib/config/types.ts
    export interface ProductConfig {
      name: string;
      description: string;
      slug: string;
      limits: {
        free: ResourceLimits;
        premium: ResourceLimits;
      };
      features: FeatureFlags;
    }

    export interface ResourceLimits {
      resourceLimit: number;
      storageLimit: number; // in MB
    }

    export interface FeatureFlags {
      enableAI: boolean;
      enableStorage: boolean;
      enableSharing: boolean;
      // Add other feature flags as needed
    }

    export interface ThemeConfig {
      colors: {
        primary: { light: string; dark: string };
        secondary: { light: string; dark: string };
        // Other color variables
      };
      fonts: {
        heading: string;
        body: string;
      };
      borderRadius: string;
      // Other theme variables
    }

    export interface SubscriptionPlan {
      id: string;
      name: string;
      description: string;
      priceId: string;
      price: number;
      currency: string;
      interval: string;
      planType: 'free' | 'premium' | 'enterprise';
      features: string[];
    }
    ```

  - [x] Create `/lib/config/index.ts` with main configuration exports
    ```typescript
    // /lib/config/index.ts
    import { productConfig } from './default-config';
    import { themeConfig } from './theme';
    import { subscriptionPlans } from './subscription';
    import { featureFlags } from './features';
    import { validateEnvironment } from './environment';

    // Validate environment variables on startup
    validateEnvironment();

    export {
      productConfig,
      themeConfig,
      subscriptionPlans,
      featureFlags,
    };

    // Helper function to check if a feature is enabled
    export function isFeatureEnabled(featureName: keyof typeof featureFlags): boolean {
      return featureFlags[featureName] === true;
    }

    // Helper function to get resource limits based on plan type
    export function getResourceLimits(planType: 'free' | 'premium'): typeof productConfig.limits.free {
      return productConfig.limits[planType];
    }
    ```

  - [x] Implement `/lib/config/default-config.ts` with default product settings
    ```typescript
    // /lib/config/default-config.ts
    import { ProductConfig } from './types';

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

  - [x] Create `/lib/config/theme.ts` for theme customization
    ```typescript
    // /lib/config/theme.ts
    import { ThemeConfig } from './types';

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

  - [x] Implement `/lib/config/subscription.ts` for subscription plans
    ```typescript
    // /lib/config/subscription.ts
    import { SubscriptionPlan } from './types';

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

  - [x] Create `/lib/config/features.ts` for feature flags
    ```typescript
    // /lib/config/features.ts
    export const featureFlags = {
      enableAI: true,
      enableStorage: true,
      enableSharing: false,
      enableAnalytics: true,
      enableMarketing: true,
      // Add other feature flags as needed
    };
    ```

  - [x] Implement `/lib/config/environment.ts` for environment variables
    ```typescript
    // /lib/config/environment.ts
    export function validateEnvironment(): void {
      const requiredVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'STRIPE_SECRET_KEY',
        'STRIPE_WEBHOOK_SECRET',
      ];

      const optionalVars = [
        'OPENAI_API_KEY',
        'ANTHROPIC_API_KEY',
        'RESEND_API_KEY',
        'EMAIL_FROM',
      ];

      const missingRequired = requiredVars.filter(
        varName => !process.env[varName]
      );

      if (missingRequired.length > 0) {
        console.warn(`Missing required environment variables: ${missingRequired.join(', ')}`);
        console.warn('Some features may not work correctly.');
      }

      const missingOptional = optionalVars.filter(
        varName => !process.env[varName]
      );

      if (missingOptional.length > 0) {
        console.info(`Missing optional environment variables: ${missingOptional.join(', ')}`);
        console.info('Some features may be disabled.');
      }
    }
    ```

  - [x] Create `/lib/config/useConfig.ts` React hook for accessing configuration
    ```typescript
    // /lib/config/useConfig.ts
    import { useCallback } from 'react';
    import { productConfig, themeConfig, subscriptionPlans, featureFlags } from './index';
    import { SubscriptionPlan } from './types';

    export function useConfig() {
      const getSubscriptionPlan = useCallback((planId: string): SubscriptionPlan | undefined => {
        return subscriptionPlans.find(plan => plan.id === planId);
      }, []);

      const isFeatureEnabled = useCallback((featureName: keyof typeof featureFlags): boolean => {
        return featureFlags[featureName] === true;
      }, []);

      return {
        product: productConfig,
        theme: themeConfig,
        subscriptionPlans,
        getSubscriptionPlan,
        isFeatureEnabled,
      };
    }
    ```

  - [x] Create `/scripts/init-config.ts` for interactive configuration setup with Stripe integration
    ```typescript
    // /scripts/init-config.ts
    import fs from 'fs';
    import path from 'path';
    import { prompt } from 'inquirer';
    import Stripe from 'stripe';
    import dotenv from 'dotenv';
    import chalk from 'chalk';

    // Load environment variables
    dotenv.config({ path: '.env.local' });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16',
    });

    async function main() {
      console.log(chalk.blue('🔧 Project Mosaic Configuration Setup'));
      console.log(chalk.gray('This script will help you configure your micro-SaaS product'));

      // Product configuration
      const productAnswers = await prompt([
        {
          type: 'input',
          name: 'name',
          message: 'What is your product name?',
          default: 'My SaaS Product',
        },
        {
          type: 'input',
          name: 'description',
          message: 'Enter a brief description:',
          default: 'A powerful micro-SaaS solution',
        },
        {
          type: 'input',
          name: 'slug',
          message: 'Enter a URL-friendly slug:',
          default: 'my-saas-product',
        },
      ]);

      // Feature configuration
      const featureAnswers = await prompt([
        {
          type: 'confirm',
          name: 'enableAI',
          message: 'Enable AI features?',
          default: true,
        },
        {
          type: 'confirm',
          name: 'enableStorage',
          message: 'Enable storage features?',
          default: true,
        },
        {
          type: 'confirm',
          name: 'enableSharing',
          message: 'Enable sharing features?',
          default: false,
        },
      ]);

      // Resource limits configuration
      const limitsAnswers = await prompt([
        {
          type: 'number',
          name: 'freeResourceLimit',
          message: 'Free tier resource limit:',
          default: 10,
        },
        {
          type: 'number',
          name: 'freeStorageLimit',
          message: 'Free tier storage limit (MB):',
          default: 5,
        },
        {
          type: 'number',
          name: 'premiumResourceLimit',
          message: 'Premium tier resource limit:',
          default: 100,
        },
        {
          type: 'number',
          name: 'premiumStorageLimit',
          message: 'Premium tier storage limit (MB):',
          default: 50,
        },
      ]);

      // Subscription plan configuration
      const planAnswers = await prompt([
        {
          type: 'input',
          name: 'premiumPlanName',
          message: 'Premium plan name:',
          default: 'Premium',
        },
        {
          type: 'input',
          name: 'premiumPlanDescription',
          message: 'Premium plan description:',
          default: 'Advanced features for professionals',
        },
        {
          type: 'number',
          name: 'premiumPlanPrice',
          message: 'Premium plan price (USD):',
          default: 9.99,
        },
        {
          type: 'list',
          name: 'premiumPlanInterval',
          message: 'Premium plan billing interval:',
          choices: ['month', 'year'],
          default: 'month',
        },
      ]);

      // Create Stripe products and prices
      console.log(chalk.blue('\n🔄 Creating Stripe products and prices...'));
      
      try {
        // Check if Stripe API key is configured
        if (!process.env.STRIPE_SECRET_KEY) {
          throw new Error('STRIPE_SECRET_KEY is not configured in .env.local');
        }

        // Create or update the premium product
        const createStripe = await prompt([
          {
            type: 'confirm',
            name: 'createStripeProduct',
            message: 'Create Stripe product and price for the premium plan?',
            default: true,
          },
        ]);

        let premiumPriceId = '';
        
        if (createStripe.createStripeProduct) {
          // Create or update the premium product
          const product = await stripe.products.create({
            name: `${productAnswers.name} ${planAnswers.premiumPlanName}`,
            description: planAnswers.premiumPlanDescription,
            metadata: {
              plan_type: 'premium',
            },
          });
          
          console.log(chalk.green(`✅ Created Stripe product: ${product.id}`));
          
          // Create price for the premium product
          const price = await stripe.prices.create({
            product: product.id,
            unit_amount: Math.round(planAnswers.premiumPlanPrice * 100), // Convert to cents
            currency: 'usd',
            recurring: {
              interval: planAnswers.premiumPlanInterval,
            },
            metadata: {
              plan_type: 'premium',
            },
          });
          
          console.log(chalk.green(`✅ Created Stripe price: ${price.id}`));
          premiumPriceId = price.id;
        }

        // Generate configuration files
        console.log(chalk.blue('\n🔄 Generating configuration files...'));
        
        // Update default-config.ts
        const defaultConfigPath = path.join(process.cwd(), 'lib', 'config', 'default-config.ts');
        const defaultConfigTemplate = `
import { ProductConfig } from './types';

export const productConfig: ProductConfig = {
  name: "${productAnswers.name}",
  description: "${productAnswers.description}",
  slug: "${productAnswers.slug}",
  limits: {
    free: {
      resourceLimit: ${limitsAnswers.freeResourceLimit},
      storageLimit: ${limitsAnswers.freeStorageLimit},
    },
    premium: {
      resourceLimit: ${limitsAnswers.premiumResourceLimit},
      storageLimit: ${limitsAnswers.premiumStorageLimit},
    }
  },
  features: {
    enableAI: ${featureAnswers.enableAI},
    enableStorage: ${featureAnswers.enableStorage},
    enableSharing: ${featureAnswers.enableSharing},
  }
};
`;
        
        // Update subscription.ts
        const subscriptionPath = path.join(process.cwd(), 'lib', 'config', 'subscription.ts');
        const subscriptionTemplate = `
import { SubscriptionPlan } from './types';

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Basic features for personal use",
    priceId: "",
    price: 0,
    currency: "USD",
    interval: "month",
    planType: "free",
    features: [
      "Up to ${limitsAnswers.freeResourceLimit} resources",
      "${limitsAnswers.freeStorageLimit}MB storage",
      "Basic features"
    ]
  },
  {
    id: "premium",
    name: "${planAnswers.premiumPlanName}",
    description: "${planAnswers.premiumPlanDescription}",
    priceId: "${premiumPriceId}",
    price: ${planAnswers.premiumPlanPrice},
    currency: "USD",
    interval: "${planAnswers.premiumPlanInterval}",
    planType: "premium",
    features: [
      "Up to ${limitsAnswers.premiumResourceLimit} resources",
      "${limitsAnswers.premiumStorageLimit}MB storage",
      "Advanced features",
      "Priority support"
    ]
  }
];
`;

        // Create directories if they don't exist
        const configDir = path.join(process.cwd(), 'lib', 'config');
        if (!fs.existsSync(configDir)) {
          fs.mkdirSync(configDir, { recursive: true });
        }
        
        // Write the files
        fs.writeFileSync(defaultConfigPath, defaultConfigTemplate.trim());
        fs.writeFileSync(subscriptionPath, subscriptionTemplate.trim());
        
        console.log(chalk.green('✅ Configuration files generated successfully!'));
        console.log(chalk.blue('\n🎉 Setup complete! Your micro-SaaS product is configured and ready to go.'));
        
        // Next steps
        console.log(chalk.yellow('\nNext steps:'));
        console.log('1. Update your database schema for your specific product');
        console.log('2. Create product-specific components and pages');
        console.log('3. Customize the marketing components for your product');
        console.log('4. Deploy your application');
        
      } catch (error) {
        console.error(chalk.red('❌ Error during configuration:'), error);
        process.exit(1);
      }
    }

    main().catch(console.error);
    ```

    Usage pattern for the configuration system:
    ```typescript
    // Example usage in a component
    import { useConfig } from '@/lib/config/useConfig';
    
    export function PricingComponent() {
      const { product, subscriptionPlans, isFeatureEnabled } = useConfig();
      
      return (
        <div>
          <h1>{product.name} Pricing</h1>
          {subscriptionPlans.map(plan => (
            <div key={plan.id}>
              <h2>{plan.name}</h2>
              <p>{plan.description}</p>
              <p>${plan.price}/{plan.interval}</p>
              <ul>
                {plan.features.map(feature => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              {plan.planType !== 'free' && (
                <button>Subscribe</button>
              )}
            </div>
          ))}
          
          {isFeatureEnabled('enableAI') && (
            <div>AI-powered features available!</div>
          )}
        </div>
      );
    }
    ```

- [x] **Email Service Layer**
  - [x] Install required packages (resend, react-email, @react-email/components)
  - [x] Create `/lib/email/email-service.ts` with provider-agnostic interface ✅
  - [x] Create `/lib/email/templates/index.ts` for template management ✅
  - [x] Implement basic email templates:
    - [x] `/lib/email/templates/components/WelcomeEmail.tsx`
    - [x] `/lib/email/templates/components/PasswordResetEmail.tsx`
    - [x] `/lib/email/templates/components/VerificationEmail.tsx`
    - [x] `/lib/email/templates/components/InvitationEmail.tsx`
  - [x] Create `/lib/auth/auth-emails.ts` to integrate with auth system
  - [x] Update auth hooks to use the email service
  - [x] Create setup scripts:
    - [x] `/scripts/setup-email.ts` - Interactive email configuration ✅
    - [x] `/scripts/test-email.ts` - Email testing utility ✅
  - [x] Update documentation in ai_docs/ and tutorial/ to include email setup ✅

- [x] **Supabase Email Integration**
  - [x] Enhance `/scripts/setup-email.ts` to guide Supabase SMTP configuration
  - [x] Update the email setup script to provide Resend SMTP credentials
  - [x] Add instructions for configuring Supabase auth email templates
  - [x] Create documentation on dual email approach:
    - Supabase handles auth emails via Resend SMTP
    - Custom email service handles transactional emails
  - [x] Update tutorial documentation:
    - [x] Update `/tutorial/7_EMAIL_INTEGRATION.md` with Supabase SMTP setup
    - [x] Add section on customizing Supabase email templates
  - [x] Update AI documentation:
    - [x] Enhance `/ai_docs/email-configuration.md` with Supabase integration
    - [x] Update `/ai_docs/email-service-guide.md` to clarify the dual approach
  - [x] Create example for sending custom transactional emails

- [ ] **Auth & Payment Services**
  - [ ] Update auth services to be template-ready
  - [ ] Enhance payment services for tiered pricing
  - [ ] Create abstraction layers for external services
  - [ ] Improve subscription management hooks

## Phase 3: Marketing & Analytics Essentials

- [ ] **Marketing Components**
  - [ ] Create `/components/marketing/HeroSection.tsx`
  - [ ] Create `/components/marketing/FeatureSection.tsx`
  - [ ] Create `/components/marketing/PricingSection.tsx`
  - [ ] Implement basic welcome email template

- [ ] **Analytics Components**
  - [ ] Create dashboard layout component
  - [ ] Implement conversion tracking
  - [ ] Add revenue metrics components
  - [ ] Create basic user engagement tracking

## Phase 4: Customization Framework

- [ ] **Theme & Branding**
  - [ ] Create `/lib/config/theme.ts` for theme configuration
  - [ ] Implement theme provider context
  - [ ] Add configuration for logo and brand assets

- [ ] **Legal & Configuration**
  - [ ] Create basic legal document templates:
    - `/templates/legal/PrivacyPolicy.md`
    - `/templates/legal/TermsOfService.md`
  - [ ] Add feature flag system for enabling/disabling features

## Phase 5: Developer Experience

- [x] **Documentation**
  - [x] Create architecture overview documentation ✅
  - [ ] Add getting started guide
  - [x] Develop GLOSSARY.md for quick reference ✅
  - [x] Create email configuration documentation ✅
  - [ ] Update tutorial files with email setup instructions

- [x] **Developer Tools**
  - [x] Create setup script for initial project configuration ✅
  - [ ] Add deployment automation script
  - [x] Create customization guide with examples ✅
  - [x] Add email testing and configuration scripts ✅
  - [x] Create dependency resolution script for AI SDK installation

## Known Issues & Solutions

- **React Version Conflict**: The project uses React 18.3.1, but @react-email/components requires React 18.2.0 specifically. When installing AI SDKs (OpenAI, Anthropic), this causes dependency conflicts.
  - **Solution**: Use `--legacy-peer-deps` flag when installing AI SDKs or downgrade React to 18.2.0 if email components are critical.
  - **Status**: Resolved by using `--legacy-peer-deps` flag when installing AI SDKs.

## Testing & Validation

- [ ] **Core Testing**
  - [ ] Create template-agnostic test utilities
  - [ ] Implement tests for core services (AI, Auth, Email, Storage, Payments)
  - [ ] Test with different product types as examples

- [ ] **Quality Assurance**
  - [ ] Verify performance metrics
  - [ ] Test accessibility compliance
  - [ ] Perform security audit
  - [x] Test email deliverability and template rendering ✅
