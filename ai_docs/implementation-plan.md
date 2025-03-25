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
  - [x] Create `/scripts/setup-subscription-plans.ts` for interactive Stripe plan configuration

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

- [x] **Subscription Plan Configuration**
  - [x] Create `/scripts/setup-subscription-plans.ts` for interactive Stripe plan setup
  - [x] Implement plan creation and metadata configuration
  - [x] Add validation for proper plan metadata
  - [x] Create testing utility for verifying plan configuration
  - [x] Update documentation in `ai_docs/stripe-configuration.md` with setup instructions
  - [x] Add subscription plan configuration to the quick setup process

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

- [x] **Payment Service Abstraction**
  - [x] Create provider-agnostic interface in `/lib/payment/payment-service.ts`
  - [x] Implement Stripe payment provider using Supabase Edge Functions
  - [x] Enhance payment service with standardized error handling
  - [x] Add retry logic for transient failures
  - [x] Add new methods to payment service interface:
    - cancelSubscription(userId: string): Promise<PaymentResponse>
    - updateSubscription(userId: string, newPriceId: string): Promise<PaymentResponse>
    - getSubscriptionStatus(userId: string): Promise<SubscriptionStatus>
    - getInvoices(userId: string, limit?: number): Promise<Invoice[]>
    - hasFeatureAccess(userId: string, featureName: string): Promise<boolean>
  - [x] Create new Edge Functions to support enhanced payment functionality:
    - `/supabase/functions/cancel-subscription/index.ts`
    - `/supabase/functions/update-subscription/index.ts`
    - `/supabase/functions/subscription-status/index.ts`
    - `/supabase/functions/list-invoices/index.ts`
  - [ ] Add unit tests for payment service functionality

- [x] **Update Subscription Hooks**
  - [x] Refactor `/hooks/useSubscription.ts` to use the new payment service
  - [x] Add subscription status helpers
    - isSubscriptionActive()
    - willSubscriptionRenew()
    - getSubscriptionEndDate()
    - isPremiumTier()
  - [x] Implement feature access checking
  - [x] Update types in `/types/subscription.ts` to support new functionality

- [ ] **Service Configuration System**
  - [x] Create service configuration helpers in `/lib/config/service-config.ts`
  - [x] Add default configurations for auth and payment services
  - [ ] Implement resource limit helpers based on subscription plans
    ```typescript
    // Example resource limit helper
    export function getResourceLimit(user: User, resourceType: string): number {
      const planType = user.subscription_plan || 'free';
      const config = getConfig();
      return config.limits[planType][resourceType] || 0;
    }
    ```

- [ ] **Unified Service Provider**
  - [x] Create a service provider in `/lib/services/index.ts`
  - [x] Implement singleton pattern for efficient service management
  - [ ] Add helper functions for accessing payment services
    ```typescript
    // Example helper in services/index.ts
    export function getPaymentService(config?: PaymentServiceConfig): PaymentProvider {
      return serviceProvider.getPaymentService(config);
    }
    ```

- [x] **Update Edge Functions**
  - [x] Enhance `/supabase/functions/create-stripe-session/index.ts` to support custom URLs
  - [x] Update `/supabase/functions/list-subscription-plans/index.ts` to include plan features
  - [x] Improve `/supabase/functions/stripe-webhook/index.ts` to handle more event types
  - [x] Create new Edge Functions for enhanced subscription management:
    - `/supabase/functions/cancel-subscription/index.ts`
    - `/supabase/functions/update-subscription/index.ts`
    - `/supabase/functions/subscription-status/index.ts`
    - `/supabase/functions/list-invoices/index.ts`
  - [x] Fix authorization handling in all Edge Functions:
    - Implement consistent API key validation
    - Support both `apikey` header and `Authorization: Bearer` token
    - Add proper error handling and debugging

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

## Phase 5: Component Reduction & Developer Experience

- [ ] **Minimalist Component Set**
  - [ ] Reduce UI components to a focused set of essential components (all fully responsive across all screen sizes):
    - **Core UI Components (shadcn/ui)**:
      - Layout: Card, Tabs, Separator, Sheet - all responsive on all screen sizes
      - Navigation: Navbar, Sidebar, Dropdown Menu, Command (⌘K) - all responsive on all screen sizes
      - Input: Button, Input, Select, Checkbox, Switch, Form, Textarea, Radio Group - all responsive on all screen sizes
      - Display: Table, Alert, Badge, Avatar, Dialog/Modal, Tooltip, Popover - all responsive on all screen sizes
      - Feedback: Toast, Progress, Skeleton - all responsive on all screen sizes
    - **SaaS-Specific Composed Components** (all fully responsive across all screen sizes):
      - AuthForm - Login/signup forms with social providers - responsive on all screen sizes
      - PricingTable - Subscription options display - responsive on all screen sizes
      - FeatureComparison - Plan feature comparison - responsive on all screen sizes
      - DashboardMetric - KPI display cards - responsive on all screen sizes
      - EmptyState - Empty data handling - responsive on all screen sizes
      - PageHeader - Consistent page headers - responsive on all screen sizes
      - SettingsForm - User/account settings - responsive on all screen sizes
      - ConfirmationDialog - Action confirmation - responsive on all screen sizes
      - OnboardingSteps - User onboarding flow - responsive on all screen sizes
      - NotificationCenter - User notifications - responsive on all screen sizes
      - APIKeyManager - For developer-focused products - responsive on all screen sizes
      - UsageStats - Resource usage display - responsive on all screen sizes
      - InviteUsers - Team member invitation - responsive on all screen sizes
      - FilterBar - Data filtering interface - responsive on all screen sizes
      - LandingHero - Marketing landing page hero section - responsive on all screen sizes
  - [ ] Create component directory structure:
    ```
    /components
      /ui           # shadcn components
      /composed     # application-specific compositions
      /layouts      # page layouts
      /marketing    # landing page components
    ```
  - [ ] Implement installation script for shadcn/ui components
  - [ ] Create component documentation page at /docs/components.tsx

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
  - [x] Add subscription plan configuration script ✅
  - [x] Create dependency resolution script for AI SDK installation

## Known Issues & Solutions

- **React Version Conflict**: The project uses React 18.3.1, but @react-email/components requires React 18.2.0 specifically. When installing AI SDKs (OpenAI, Anthropic), this causes dependency conflicts.
  - **Solution**: Use `--legacy-peer-deps` flag when installing AI SDKs or downgrade React to 18.2.0 if email components are critical.
  - **Status**: Resolved by using `--legacy-peer-deps` flag when installing AI SDKs.

- **Edge Function Implementation**: The enhanced payment service requires several new Edge Functions that need to be implemented:
  - **Solution**: Create the following Edge Functions:
    - `/supabase/functions/cancel-subscription/index.ts` - For canceling subscriptions
    - `/supabase/functions/update-subscription/index.ts` - For updating subscription plans
    - `/supabase/functions/subscription-status/index.ts` - For retrieving subscription status
    - `/supabase/functions/list-invoices/index.ts` - For retrieving invoice history
  - **Status**: ✅ Implemented

- **Subscription Type Updates**: The enhanced subscription hook requires updates to the subscription types.
  - **Solution**: Update `/types/subscription.ts` to include new interfaces for SubscriptionStatus and Invoice
  - **Status**: ✅ Implemented

- **Edge Function Authorization**: Edge Functions were returning 401 Unauthorized errors due to inconsistent API key handling.
  - **Solution**: 
    - Update all Edge Functions to properly handle both `apikey` header and `Authorization: Bearer` token format
    - Ensure payment service sends consistent authorization headers with both formats
    - Add proper error handling and debugging for authorization issues
  - **Status**: ✅ Resolved - All Edge Functions now properly validate API keys

- **Stripe Product Configuration**: The subscription plans endpoint was returning an empty array due to missing product configuration in Stripe.
  - **Solution**:
    - Ensure Stripe products are created with proper metadata including `plan_type`
    - Add comprehensive logging in Edge Functions to debug issues
    - Enhance the price-to-plan mapping in the webhook handler
  - **Status**: ⚠️ Partially Resolved - Edge Function returns empty plans array despite products being created in Stripe

- **Subscription Plans Test Script Issue**: The test-subscription-plans script shows "No subscription plans found" despite plans being created in Stripe.
  - **Solution**:
    - Debug the list-subscription-plans Edge Function to ensure it correctly fetches and formats Stripe products
    - Verify that product metadata is being properly set during plan creation
    - Add additional logging to trace the flow from Stripe API to response
    - Ensure proper authorization headers are sent with the request
  - **Status**: ✅ Resolved - Enhanced logging and authorization handling in Edge Functions

## Component Implementation Strategy

- [ ] **Installation & Setup**
  - [ ] Install shadcn/ui base components:
    ```bash
    npx shadcn-ui@latest init
    npx shadcn-ui@latest add button card input form toast dialog
    # Continue with other core components
    ```
  - [ ] Configure tailwind.config.js for consistent theming
  - [ ] Set up component documentation page

- [ ] **Core Components Implementation**
  - [ ] Install and configure all core shadcn/ui components
  - [ ] Create consistent styling overrides
  - [ ] Implement responsive design for all screen sizes (mobile, tablet, desktop, large screens)
  - [ ] Test components on various device sizes and orientations
  - [ ] Document usage patterns for each component including responsive behavior

- [ ] **Composed Components Implementation**
  - [ ] Implement high-priority composed components first:
    - AuthForm - with mobile-first responsive design
    - PricingTable - with responsive layouts for all device sizes
    - FeatureComparison - with adaptive display for small screens
    - DashboardMetric - with responsive sizing and stacking
    - EmptyState - with properly scaled illustrations for all devices
  - [ ] Add remaining composed components as needed for specific products
  - [ ] Ensure all components use responsive design principles (fluid layouts, appropriate text sizing, touch targets)
  - [ ] Test all components across device sizes (320px mobile to 4K displays)
  - [ ] Create storybook-like examples for each composed component showing responsive behavior

## Testing & Validation

- [ ] **Testing Guidelines**
  - [ ] One E2E Test: Create a single Playwright or Cypress test that runs through signup → payment → accessing a premium feature.
  - [ ] Service Initialization Tests: Simple tests that verify your service abstractions initialize correctly.
  - [ ] Pre-Launch Checklist: A markdown file with a manual testing checklist for each product.
  - [ ] Strong TypeScript: Focus on robust typing rather than extensive unit tests.
  - [ ] Component Visual Testing: Simple visual tests for core components
  - [ ] Responsive Testing: Test all components at standard breakpoints (320px, 768px, 1024px, 1440px, 1920px)
  - [ ] Device Testing: Verify functionality on actual mobile devices, tablets, and desktops
  - [ ] Cross-browser Testing: Ensure components work in Chrome, Firefox, Safari, and Edge

This approach would give you practical confidence in your applications without the time sink of comprehensive test suites.

- [x] **Completed Testing Tasks**
  - [x] Test email deliverability and template rendering ✅
  - [x] Test Edge Function authorization and error handling ✅
  - [x] Fix subscription plans test script ✅
  - [x] Create Stripe product configuration guide ✅
