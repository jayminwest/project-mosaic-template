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
  - [ ] Set up configuration system for project customization
  - The configuration system will be implemented with the following structure:
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
  - [ ] Update environment variable structure with better documentation
  - [x] Create placeholder dashboard page

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
  - [x] Create `/lib/config/index.ts` with main configuration exports
  - [x] Implement `/lib/config/default-config.ts` with default product settings
  - [x] Create `/lib/config/theme.ts` for theme customization
  - [x] Implement `/lib/config/subscription.ts` for subscription plans
  - [x] Create `/lib/config/features.ts` for feature flags
  - [x] Implement `/lib/config/environment.ts` for environment variables
  - [x] Create `/lib/config/useConfig.ts` React hook for accessing configuration
  - [x] Create `/scripts/init-config.ts` for interactive configuration setup with Stripe integration
  - [x] Create `/lib/config/quick-setup.ts` for single-file LLM-friendly configuration
  - [x] Create `/scripts/quick-setup.ts` to process the quick setup configuration

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

- [x] **Auth & Payment Services**
  - [x] Create auth service abstraction in `/lib/auth/auth-service.ts`
  - [x] Create payment service abstraction in `/lib/payment/payment-service.ts`
  - [x] Create service configuration helpers in `/lib/config/service-config.ts`
  - [x] Create unified service provider in `/lib/services/index.ts`
  
  - [ ] Update hooks to use new abstraction layers
    ```typescript
    // hooks/useAuth.ts
    export function useAuth(config: AuthConfig = {}): UseAuthReturn {
      const authService = createAuthService(config);
      // Use authService for all auth operations
    }
    
    // hooks/useSubscription.ts
    export function useSubscription(config: PaymentServiceConfig = {}): UseSubscriptionReturn {
      const paymentService = createPaymentService(config);
      // Use paymentService for all subscription operations
    }
    ```

## Phase 3: Auth & Payment Services

- [x] **Auth Service Abstraction**
  - [x] Create provider-agnostic interface in `/lib/auth/auth-service.ts`
  - [x] Implement Supabase auth provider
  - [x] Update auth hooks to use the new abstraction
  - [x] Add configuration options for auth providers
  - [x] Integrate with email service

- [ ] **Payment Service Abstraction**
  - [x] Create provider-agnostic interface in `/lib/payment/payment-service.ts`
  - [x] Implement Stripe payment provider using Supabase Edge Functions
  - [ ] Update subscription hooks to use the new abstraction
  - [ ] Add support for tiered pricing
  - [ ] Improve subscription management

- [ ] **Service Configuration System**
  - [x] Create service configuration helpers in `/lib/config/service-config.ts`
  - [x] Add default configurations for auth and payment services
  - [ ] Implement resource limit helpers based on subscription plans

- [ ] **Unified Service Provider**
  - [x] Create a service provider in `/lib/services/index.ts`
  - [x] Implement singleton pattern for efficient service management
  - [ ] Add helper functions for accessing payment services

- [ ] **Update Edge Functions**
  - [ ] Enhance `/supabase/functions/create-stripe-session/index.ts` to support custom URLs
  - [ ] Update `/supabase/functions/list-subscription-plans/index.ts` to include plan features
  - [ ] Improve `/supabase/functions/stripe-webhook/index.ts` to handle more event types

## Phase 4: Marketing & Analytics Essentials

- [ ] **Theme & Branding**
  - [ ] Implement theme configuration system
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
