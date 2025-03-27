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
    - `/lib/config` - Configuration system ✅
    - `/lib/email` - Email service system ✅
    - `/components/marketing` - Marketing components ✅
    - `/components/analytics` - Analytics components
  - [x] Set up configuration system for project customization ✅
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
  - [x] Update environment variable structure with better documentation
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

- [x] **Configuration System** ✅
  - [x] Create `/lib/config/types.ts` with configuration interfaces ✅
    - Implemented interfaces for ProductConfig, ResourceLimits, FeatureFlags, ThemeConfig, and SubscriptionPlan
    - Added proper typing for all configuration components
  - [x] Create `/lib/config/index.ts` with main configuration exports ✅
    - Exports all configuration components
    - Provides helper functions like isFeatureEnabled and getResourceLimits
    - Validates environment variables on startup
  - [x] Implement `/lib/config/default-config.ts` with default product settings ✅
    - Defines product name, description, resource limits, and feature flags
    - Includes routes configuration for public and authenticated paths
    - Adds storage configuration for bucket names
  - [x] Create `/lib/config/theme.ts` for theme customization ✅
    - Implements comprehensive color scheme with light/dark mode support
    - Defines typography settings with font families
    - Includes UI element styling like border radius
  - [x] Implement `/lib/config/subscription.ts` for subscription plans ✅
    - Defines free and premium subscription tiers
    - Includes pricing, features, and plan types
  - [x] Create `/lib/config/features.ts` for feature flags ✅
    - Controls which features are enabled in the application
    - Supports AI, storage, sharing, analytics, and marketing features
  - [x] Implement `/lib/config/environment.ts` for environment variables ✅
    - Validates required and optional environment variables
    - Provides detailed reporting of missing variables
    - Checks feature-specific variables
  - [x] Create `/lib/config/service-config.ts` for service configuration ✅
    - Provides configuration for auth and payment services
    - Includes default settings with override capability
  - [x] Create `/lib/config/useConfig.ts` React hook for accessing configuration ✅
    - Provides easy access to all configuration in React components
    - Includes helper methods for subscription plans and feature flags
  - [x] Create `/scripts/init-config.ts` for interactive configuration setup ✅
  - [x] Create `/lib/config/quick-setup.ts` for single-file LLM-friendly configuration ✅
  - [x] Create `/scripts/quick-setup.ts` to process the quick setup configuration ✅
  - [x] Create `/scripts/setup-subscription-plans.ts` for interactive Stripe plan configuration ✅

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
  
  - [x] Update hooks to use service provider pattern for abstraction layers
    ```typescript
    // hooks/useAuth.ts
    export function useAuth(): UseAuthReturn {
      const services = getServiceProvider();
      const authService = services.getAuthService();
      // Use authService for all auth operations
    }
    
    // hooks/useSubscription.ts
    export function useSubscription(): UseSubscriptionReturn {
      const services = getServiceProvider();
      const paymentService = services.getPaymentService();
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

- [x] **Marketing Components**
  - [x] Implement HeroSection component ✅
  - [x] Implement FeatureSection component ✅
  - [x] Implement PricingSection component ✅
  - [x] Implement TestimonialSection component ✅
  - [x] Implement CTASection component ✅
  - [x] Create responsive landing page with all marketing components ✅
  - [x] Update PricingSection to dynamically fetch pricing tiers ✅

- [x] **Component Implementation Status**
  - **Core UI Components**: 14 out of 24 components implemented (58%)
  - **SaaS-Specific Composed Components**: 6 out of 15 components implemented (40%)
  - **Marketing Components**: All 5 components implemented (100%)
  - **Database Schema**: Enhanced with email preferences and usage tracking

- [x] **Theme & Branding**
  - [x] Implement theme configuration system
  - [x] Implement theme provider context
  - [ ] Add configuration for logo and brand assets

- [x] **Legal & Configuration**
  - [x] Create basic legal document templates:
    - `/app/legal/page.tsx` with Privacy Policy and Terms of Service ✅

## Phase 5: Component Reduction & Developer Experience

- [ ] **Minimalist Component Set**
  - [ ] Reduce UI components to a focused set of essential components (all fully responsive across all screen sizes):
    - **Core UI Components (shadcn/ui)**:
      - Layout: Card ✅, Tabs ❌, Separator ❌, Sheet ❌ - all responsive on all screen sizes
      - Navigation: Navbar ✅, Sidebar ❌, Dropdown Menu ❌, Command (⌘K) ❌ - all responsive on all screen sizes
      - Input: Button ✅, Input ✅, Select ✅, Checkbox ✅, Switch ❌, Form ❌, Textarea ✅, Radio Group ❌, Calendar ✅ - all responsive on all screen sizes
      - Display: Table ✅, Alert ❌, Badge ✅, Avatar ❌, Dialog/Modal ✅, Tooltip ❌, Popover ✅ - all responsive on all screen sizes
      - Feedback: Toast ✅, Progress ❌, Skeleton ✅ - all responsive on all screen sizes
    - **SaaS-Specific Composed Components** (all fully responsive across all screen sizes):
      - AuthForm ✅ - Login/signup forms with social providers - responsive on all screen sizes
      - PricingTable ✅ - Subscription options display - responsive on all screen sizes
      - FeatureComparison ❌ - Plan feature comparison - responsive on all screen sizes
      - DashboardMetric ✅ - KPI display cards - responsive on all screen sizes
      - EmptyState ❌ - Empty data handling - responsive on all screen sizes
      - PageHeader ❌ - Consistent page headers - responsive on all screen sizes
      - SettingsForm ✅ - User/account settings - responsive on all screen sizes
      - ConfirmationDialog ❌ - Action confirmation - responsive on all screen sizes
      - OnboardingSteps ❌ - User onboarding flow - responsive on all screen sizes
      - NotificationCenter ❌ - User notifications - responsive on all screen sizes
      - APIKeyManager ❌ - For developer-focused products - responsive on all screen sizes
      - UsageStats ✅ - Resource usage display - responsive on all screen sizes
      - InviteUsers ❌ - Team member invitation - responsive on all screen sizes
      - FilterBar ❌ - Data filtering interface - responsive on all screen sizes
      - LandingHero ✅ - Marketing landing page hero section - responsive on all screen sizes
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
  - [x] Update tutorial files with email setup instructions

- [x] **Developer Tools**
  - [x] Create setup script for initial project configuration ✅
  - [ ] Add deployment automation script
  - [x] Create customization guide with examples ✅
  - [x] Add email testing and configuration scripts ✅
  - [x] Add subscription plan configuration script ✅
  - [x] Create dependency resolution script for AI SDK installation

- [x] **UI Components**
  - [x] Update LoadingSkeleton component to support different types (card, list, table, form) ✅
  - [x] Make Header component fully responsive with mobile menu ✅
  - [x] Update Header navigation links to point to existing pages ✅
  - [x] Make Footer component responsive ✅
  - [x] Update Footer links to point to existing pages ✅
  - [x] Update dashboard page with responsive layout and tabs ✅
  - [x] Create landing page with marketing components ✅
  - [x] Fix centering issues in marketing components ✅
  - [x] Implement DashboardMetric component for KPI display ✅
  - [x] Implement SettingsForm component for user profile management ✅
  - [x] Implement UsageStats component with visual progress bars ✅
  - [x] Enhance profile page with responsive layout and real data ✅
  - [x] Improve dashboard with project and integration tabs ✅
  - [x] **Profile Page Functionality**:
    - [x] Implement real profile data saving functionality
    - [x] Connect usage metrics to actual database values
    - [x] Add API endpoint for updating user profile via RPC function
    - [x] Implement account deletion UI (backend implementation pending)
    - [x] Add email preferences management with proper JSONB storage
    - [x] Create password change functionality

## Phase 6: Pricing Page Fix & A/B Testing Framework

- [x] **Pricing Page Fix**
  - [x] Update the `usePricingTiers` hook to properly handle Stripe product data
  - [x] Fix the Edge Function to correctly parse product metadata
  - [x] Enhance error handling in the pricing component to show fallback plans
  - [x] Add better logging for debugging pricing issues
  - [x] Create a troubleshooting guide for common pricing page issues
  - [x] Update the Stripe configuration documentation with clearer metadata requirements
  - [x] Implement a more robust fallback mechanism for when Stripe data is unavailable
  - [x] Fix infinite refresh issue on pricing page by adding fetch attempt tracking
  - [x] Resolve Supabase client initialization issues in usePricingTiers hook
  - [x] Add hydration mismatch prevention with isMounted state
  - [x] Update PricingSection component to use the same data source as pricing page ✅
  - [x] Simplify pricing page to use the updated PricingSection component ✅
  - [x] Remove static pricing tiers from landing page ✅

- [x] **Checkout Session Implementation**
  - [x] Update the checkout session creation to use real Stripe product IDs
  - [x] Implement proper error handling for checkout session creation
  - [x] Add success and cancel URL configuration
  - [x] Create checkout success and cancel pages
  - [x] Implement webhook handling for checkout session completion
  - [x] Add subscription status checking after checkout
  - [x] Test checkout flow with real Stripe products
  - [x] Add automatic subscription flow from URL parameters
  - [x] Create environment reset script for testing
  - [x] Fix profile page to handle subscription query parameters
  - [x] Implement proper error handling for subscription flow
                                                                  
## Phase 6: Pricing Page Fix & A/B Testing Framework                             
                                                                                 
- [x] **Pricing Page Fix**                                                       
  - [x] Update the `usePricingTiers` hook to properly handle Stripe product data 
  - [x] Fix the Edge Function to correctly parse product metadata                
  - [x] Enhance error handling in the pricing component to show fallback plans   
  - [x] Add better logging for debugging pricing issues                          
  - [x] Create a troubleshooting guide for common pricing page issues            
  - [x] Update the Stripe configuration documentation with clearer metadata      
requirements                                                                     
  - [x] Implement a more robust fallback mechanism for when Stripe data is       
unavailable                                                                      
  - [x] Fix infinite refresh issue on pricing page by adding fetch attempt       
tracking                                                                         
  - [x] Resolve Supabase client initialization issues in usePricingTiers hook    
  - [x] Add hydration mismatch prevention with isMounted state                   
  - [x] Update PricingSection component to use the same data source as pricing   
page ✅                                                                          
  - [x] Simplify pricing page to use the updated PricingSection component ✅     
  - [x] Remove static pricing tiers from landing page ✅                         
                                                                                 
- [x] **Checkout Session Implementation**                                        
  - [x] Update the checkout session creation to use real Stripe product IDs      
  - [x] Implement proper error handling for checkout session creation            
  - [x] Add success and cancel URL configuration                                 
  - [x] Create checkout success and cancel pages                                 
  - [x] Implement webhook handling for checkout session completion               
  - [x] Add subscription status checking after checkout                          
  - [x] Test checkout flow with real Stripe products                             
  - [x] Add automatic subscription flow from URL parameters                      
  - [x] Create environment reset script for testing                              
  - [x] Fix profile page to handle subscription query parameters                 
  - [x] Implement proper error handling for subscription flow                    
         
- [ ] **User Plan Correspondence**
  - [x] Create a centralized feature access system:
    - [x] Created `lib/config/plan-access.ts` with helper functions for resource limits and feature access
    - [x] Integrated with Stripe subscription plans for dynamic feature access
    - [x] Added fallback to default values when Stripe data is unavailable
    - [x] Added product config integration for additional flexibility
    - [x] Updated `lib/config/useConfig.ts` to expose plan feature helpers
      
  - [x] Update dashboard to show features based on user's subscription plan:
    - [x] Modified `app/dashboard/page.tsx` to use feature access helpers
    - [x] Created `components/composed/UpgradePrompt.tsx` component for premium feature prompts
      
  - [x] Modify profile page to display correct resource limits based on plan:
    - [x] Updated `app/profile/page.tsx` to use the plan-based resource limits
    - [x] Added dynamic limit calculation based on Stripe plan data
      
  - [x] Implement AI usage limits that correspond to the user's plan:
    - [x] Updated `components/composed/AIAssistant.tsx` to enforce limits based on subscription tier
    - [x] Added usage counter and upgrade prompts when approaching limits
    - [x] Integrated with Stripe plan data for dynamic limits
      
  - [x] Add visual indicators for premium features:
    - [x] Created `components/ui/premium-badge.tsx` component with locked/premium states
    - [x] Added badges to premium features in the dashboard
      
  - [x] Implement graceful degradation for features not available in user's plan:
    - [x] Created `hooks/useFeatureAccess.ts` hook for centralized feature access control
    - [x] Implemented conditional rendering based on subscription tier
    - [x] Added fallback mechanisms when plan data is unavailable
      
  - [x] Add upgrade prompts for free users when accessing premium features:
    - [x] Created `components/composed/FeatureLimit.tsx` component to display usage limits
    - [x] Added visual indicators when approaching resource limits
    - [x] Implemented upgrade prompts throughout the application
      
  - [ ] Test all features with both free and premium accounts:
    - [ ] Verify feature access control works correctly with Stripe plans
    - [ ] Test upgrade flows from free to premium features
    - [ ] Verify resource limits are enforced correctly
    - [ ] Test visual indicators for premium features
    - [ ] Ensure graceful degradation works as expected
    - [ ] Verify upgrade prompts appear at appropriate times
    - [ ] Test fallback to default values when Stripe is unavailable
    - [x] Fix test-plan-features script to properly import from lib/config
                                                                    

- [x] **Stripe Customer Portal Configuration**
  - [x] Add documentation on setting up Stripe Customer Portal in test mode
  - [x] Create step-by-step guide for configuring portal settings at https://dashboard.stripe.com/test/settings/billing/portal
  - [x] Update create-stripe-session function to handle missing portal configuration
  - [x] Add fallback mechanism when portal is not configured
  - [x] Implement better error handling for portal-related errors
  - [x] Add configuration check in setup-subscription-plans script:
    - [x] Create a function to check if the Stripe Customer Portal is configured
    - [x] Add guidance in the script to help users configure the portal
    - [x] Provide a link to the Stripe dashboard portal configuration page
    - [x] Add a verification step to ensure the portal is properly configured
  - [x] Create troubleshooting guide for common Stripe portal issues
  - [x] Create a portal testing script in scripts/test-portal-configuration.ts:
    - [x] Add the script to package.json: `"test-portal": "NODE_OPTIONS='--experimental-specifier-resolution=node' ts-node --esm --skipProject scripts/test-portal-configuration.ts"`
    - [x] Implement tests for fully configured portal
    - [x] Implement tests for partially configured portal (simulated)
    - [x] Implement tests for unconfigured portal (error handling)
    - [x] Add ability to create test customers and portal sessions
    - [x] Add interactive prompts to verify portal functionality
  - [x] Create a SubscriptionManager component for profile page:
    - [x] Implement proper UI for subscription management
    - [x] Add cancellation confirmation dialog using existing Dialog component
    - [x] Show subscription status including end date for cancelled subscriptions
    - [x] Add visual feedback during cancellation process
    - [x] Display clear information about what cancellation means
    - [x] Integrate with existing cancel-subscription Edge Function
    - [x] Add option to reactivate cancelled subscriptions
  - [x] Document test results and any issues found in ai_docs/stripe-portal-test-results.md

- [x] **Stripe Webhook Fixes**
  - [x] Fix webhook authorization issues:
    - [x] Remove authorization check for Stripe webhook endpoint
    - [x] Update error status code for missing signature from 401 to 400
    - [x] Add better logging for webhook events
    - [x] Create test script for webhook functionality
    - [x] Add documentation on testing webhooks with Stripe CLI
    - [x] Update implementation plan with webhook fixes
  - [x] Create webhook testing script:
    - [x] Add script to package.json: `"test-webhook": "NODE_OPTIONS='--experimental-specifier-resolution=node' ts-node --esm --skipProject scripts/test-webhook.ts"`
    - [x] Implement CORS preflight test
    - [x] Test webhook endpoint without signature
    - [x] Add guidance for triggering real webhook events with Stripe CLI

- [ ] **Subscription Cancellation Handling**
  - [ ] Implement proper UI feedback when a user cancels their subscription:
    - [ ] Create a confirmation modal with clear messaging about what cancellation means
    - [ ] Add visual feedback during the cancellation process (loading state)
    - [ ] Show success message after successful cancellation
    - [ ] Display information about when access will end
  - [ ] Add confirmation dialog before cancellation to reduce accidental cancellations:
    - [ ] Create a reusable ConfirmationDialog component in components/ui/
    - [ ] Add clear messaging about the consequences of cancellation
    - [ ] Include option to provide cancellation reason (optional)
  - [x] Create webhook handler for subscription cancellation events:
    - [x] Update stripe-webhook function to handle customer.subscription.deleted events
    - [x] Add logic to update user profile with correct subscription status
    - [x] Implement proper error handling for webhook processing
  - [x] Update user profile with correct subscription status after cancellation:
    - [x] Modify profile table to track cancellation date and reason
    - [x] Update subscription_status field to reflect cancellation
    - [x] Ensure UI correctly displays cancellation status
  - [ ] Implement grace period for accessing premium features after cancellation:
    - [ ] Add logic to check if user is in grace period in hasFeatureAccess function
    - [ ] Update UI to show grace period expiration date
    - [ ] Create helper function to calculate remaining grace period days
  - [ ] Add re-subscribe option for recently cancelled subscriptions:
    - [ ] Show re-subscribe button for cancelled subscriptions
    - [ ] Implement one-click reactivation for subscriptions in grace period
    - [ ] Add special messaging for returning customers
  - [ ] Create email notification for subscription cancellation:
    - [ ] Design cancellation email template in lib/email/templates/components/
    - [ ] Add function to send cancellation email in lib/auth/auth-emails.ts
    - [ ] Include information about grace period and how to resubscribe
  - [ ] Add analytics tracking for cancellation reasons:
    - [ ] Create cancellation_reasons table in database
    - [ ] Add logic to store cancellation reasons from confirmation dialog
    - [ ] Create simple report view for cancellation analytics
  - [ ] Implement subscription retention offers for cancelling users:
    - [ ] Create a mechanism to offer discounts to cancelling users
    - [ ] Add UI for displaying retention offers in cancellation flow
    - [ ] Implement backend logic to apply retention discounts
  - [ ] Test full cancellation flow from UI to database updates:
    - [ ] Create test script for cancellation flow
    - [ ] Verify all database updates occur correctly
    - [ ] Test email notifications are sent properly
    - [ ] Ensure grace period works as expected

- [ ] **A/B Testing Service Layer**
  - [ ] Create core types and service interface for A/B testing
  - [ ] Implement Supabase provider for self-hosted A/B testing
  - [ ] Create React hook and component for easy integration
  - [ ] Add Supabase database migrations for A/B testing tables
  - [ ] Integrate with service provider architecture
  - [ ] Create admin dashboard for managing tests
  - [ ] Add documentation and examples

- [ ] **Documentation & AI Assistance**
  - [ ] Update tutorial/ directory for use with Aider as standalone tool:
    - [ ] Reorganize tutorial files to be more modular and standalone
    - [ ] Add specific instructions for using with Aider
    - [ ] Create numbered sequence for step-by-step guidance
    - [ ] Add code examples that can be directly copied
    - [ ] Include troubleshooting sections for common issues
    - [ ] Create a tutorial index file for easy navigation
    - [ ] Add screenshots or diagrams where helpful
    - [ ] Ensure all commands are properly formatted for copy-paste
  
  - [ ] Ensure ai_docs/ directory is current and comprehensive:
    - [ ] Audit all existing documentation for accuracy
    - [ ] Update any outdated information
    - [ ] Add missing documentation for new features
    - [ ] Create a comprehensive index of all documentation
    - [ ] Ensure consistent formatting across all files
    - [ ] Add cross-references between related documents
    - [ ] Include more code examples and usage patterns
    - [ ] Create specialized documentation for AI assistance
    - [ ] Add troubleshooting guides for common issues
    - [ ] Ensure all configuration options are documented

## Phase 7: AI Dashboard Integration

- [x] **AI Usage Tracking Database Schema**
  - [x] Created migration file `supabase/migrations/30_ai_usage_metrics.sql` with:
    - Table for tracking AI interactions with user_id, prompt_length, response_length, model_used
    - RLS policies for secure access
    - Added AI metrics columns to profiles table (ai_interactions_count, ai_tokens_used)
    - Created trigger function to update metrics on new interactions
    - Implemented proper security with RLS policies for data isolation

- [x] **AI Metrics Hook**
  - [x] Created `hooks/useAIMetrics.ts` to fetch AI usage data:
    - Retrieves interaction count and tokens used from profiles
    - Fetches recent interactions with timestamps
    - Handles loading and error states
    - Returns formatted metrics for display
    - Uses the same Supabase client initialization pattern as in auth-service.ts
    - Implements refreshMetrics function for manual data refresh

- [x] **AI Components Integration**
  - [x] Created `components/composed/AIAssistant.tsx` with:
    - Simple text input for user prompts
    - Submit button to send requests to AI service
    - Display area for AI responses
    - Integration with existing useAI hook for AI service access
    - Database logging of interactions using Supabase client
    - Error handling with toast notifications
    - Loading state management
    - Responsive design for all screen sizes
    - Provider and model selection dropdowns
    - Support for different AI models and providers

  - [x] Created `components/composed/AIMetrics.tsx` to display usage statistics:
    - Uses DashboardMetric component for key metrics
    - Shows interaction count, tokens used, and average response length
    - Displays recent interactions with timestamps in a scrollable container
    - Handles loading and error states with appropriate UI feedback
    - Implements empty state for new users
    - Responsive layout for all screen sizes
    - Real-time updates using Supabase subscriptions
    - Manual refresh button for immediate updates

- [x] **Dashboard Integration**
  - [x] Updated `app/dashboard/page.tsx` to:
    - Add "AI Assistant" tab to the existing tab structure
    - Include AIAssistant component in the AI tab
    - Add AIMetrics component to both AI tab and Analytics tab
    - Add AI usage button to Quick Actions card
    - Implement responsive layout for all screen sizes
    - Handle loading and error states appropriately

- [x] **API Key Debugging**
  - [x] Created `components/composed/APIKeyDebugger.tsx` to:
    - Check for presence of API keys in environment variables
    - Display API key status and configuration information
    - Provide helpful troubleshooting information
    - Guide users through proper API key setup
    - Integrated into the AI Assistant tab for easy access

- [x] **Testing & Validation**
  - [x] Applied database migration with `npx supabase migration up`
  - [x] Tested AI interaction flow:
    - Submit prompts and verify responses
    - Checked database for logged interactions
    - Verified metrics update correctly
    - Tested with different AI providers and models
  - [x] Tested with different user accounts to ensure proper data isolation
  - [x] Verified responsive layout on different screen sizes
  - [x] Tested error handling when AI service is unavailable
  - [x] Verified that RLS policies are working correctly by attempting to access another user's data
  - [x] Tested real-time updates with Supabase subscriptions

- [x] **AI Provider Implementation**
  - [x] Enhanced OpenAI provider with:
    - Support for both Responses API and Chat Completions API
    - Proper error handling and fallback mechanisms
    - Streaming support for real-time responses
    - Embedding functionality for vector operations
    - Support for NEXT_PUBLIC_ environment variables for browser usage
  - [x] Implemented Anthropic provider with:
    - Claude model support
    - Streaming capabilities
    - Proper error handling
    - Message format conversion
    - Support for NEXT_PUBLIC_ environment variables for browser usage

- [x] **AI Service Hooks**
  - [x] Enhanced useAI hook with:
    - Support for both streaming and non-streaming completions
    - Template-based prompt generation
    - Error handling and loading state management
    - Configuration options for different AI models
    - Provider selection capabilities

## Known Issues & Solutions

- **React Version Conflict**: The project uses React 18.3.1, but @react-email/components requires React 18.2.0 specifically. When installing AI SDKs (OpenAI, Anthropic), this causes dependency conflicts.
  - **Solution**: Use `--legacy-peer-deps` flag when installing AI SDKs or downgrade React to 18.2.0 if email components are critical.
  - **Status**: ✅ Resolved by using `--legacy-peer-deps` flag when installing AI SDKs.

- **Pricing Page Not Showing Plans**: The pricing page was not displaying subscription plans from Stripe.
  - **Solution**:
    - Fix the `usePricingTiers` hook to properly handle API responses
    - Update the Edge Function to correctly parse Stripe product metadata
    - Enhance error handling to show fallback plans when API fails
    - Add more detailed logging for troubleshooting
    - Ensure Stripe products have the required metadata fields:
      - `plan_type`: Must be exactly "free", "premium", or "enterprise"
      - `features`: Comma-separated list of features or individual feature_1, feature_2, etc.
      - `limit_xxx`: Resource limits for the plan (optional)
    - Fix infinite refresh issue by adding fetch attempt tracking
    - Resolve Supabase client initialization issues
    - Add hydration mismatch prevention with isMounted state
  - **Status**: ✅ Resolved - Fixed by updating the hook and Edge Function with proper Promise handling

- **Stripe Product Retrieval**: The Edge Function was returning empty plan objects despite correctly processing Stripe products.
  - **Solution**:
    - Fix Promise handling in the Edge Function to properly await all promises
    - Add more detailed logging to diagnose issues
    - Implement robust fallback plan mechanism
    - Ensure proper filtering of null values
    - Fix Supabase API key configuration
  - **Status**: ✅ Resolved - Fixed by improving Promise handling in the Edge Function

- **Supabase RPC Function Connection**: The profile update functionality using Supabase RPC functions is not working correctly.
  - **Solution**: Debug the connection to the Supabase RPC function, ensure proper permissions are set, and verify the function is correctly deployed.
  - **Status**: ✅ Resolved - Using direct database updates instead of RPC functions

- **Next.js Server Component Error**: The application was showing "Unsupported Server Component type: undefined" errors.
  - **Solution**: 
    - Add "use client" directive to components that use client-side hooks
    - Fix import issues with named vs default exports
    - Ensure proper React imports in all client components
    - Remove duplicate components in the component tree
  - **Status**: ✅ Resolved - All components now render correctly

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

- **Supabase Edge Function Authorization Bypass Issue**: ✅ Resolved - Successfully implemented authorization bypass for Stripe webhook functions.
  - **Solution**: 
    - Added explicit configuration in `supabase/config.toml` to disable JWT verification:
      ```toml
      [functions.stripe-webhook]
      enabled = true
      verify_jwt = false

      [functions.stripe-webhook-test]
      enabled = true
      verify_jwt = false
      ```
    - Modified webhook functions to handle requests without authorization headers gracefully
    - Updated CORS headers to include necessary headers for Stripe webhook requests
    - Deployed the functions with `supabase functions deploy stripe-webhook-test` and `supabase functions deploy stripe-webhook`
    - Testing with curl now returns 200 OK with a helpful message instead of 401 Unauthorized
  - **Key Insight**: 
    - Supabase Edge Functions have a global middleware that enforces JWT verification by default
    - This must be explicitly disabled in the `config.toml` file using the `verify_jwt = false` setting
    - Simply handling unauthorized requests in the function code is not sufficient
  - **Verification**:
    - Successfully tested with both the test webhook endpoint and the main Stripe webhook endpoint
    - Both CORS preflight (OPTIONS) and direct POST requests work correctly
    - The webhook returns a helpful message explaining that it requires a Stripe-Signature header for actual webhook processing

- **Stripe Product Configuration**: The subscription plans endpoint was returning an empty array due to missing product configuration in Stripe.
  - **Solution**:
    - Ensure Stripe products are created with proper metadata including `plan_type`
    - Add comprehensive logging in Edge Functions to debug issues
    - Enhance the price-to-plan mapping in the webhook handler
  - **Status**: ✅ Resolved - Fixed by ensuring proper metadata on Stripe products

- **Subscription Plans Test Script Issue**: The test-subscription-plans script shows "No subscription plans found" despite plans being created in Stripe.
  - **Solution**:
    - Debug the list-subscription-plans Edge Function to ensure it correctly fetches and formats Stripe products
    - Verify that product metadata is being properly set during plan creation
    - Add additional logging to trace the flow from Stripe API to response
    - Ensure proper authorization headers are sent with the request
  - **Status**: ✅ Resolved - Fixed by updating the Edge Function to properly parse product metadata

- **Email Preferences Data Corruption**: The email preferences data in the database is being stored as a corrupted JSON string.
  - **Solution**:
    - Create a migration to fix the data type and repair corrupted data
    - Ensure the column is properly defined as JSONB
    - Fix the frontend code to properly handle JSON objects
  - **Status**: ✅ Resolved - Added migration 20_fix_email_preferences.sql to repair corrupted data

- **A/B Testing Implementation**: The A/B testing framework requires database schema changes and new service abstractions.
  - **Solution**:
    - Create Supabase migration for A/B testing tables
    - Implement provider-agnostic A/B testing service
    - Create React components for easy A/B test integration
    - Add admin dashboard for test management
  - **Status**: 🔄 Planned - To be implemented in Phase 6

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
  - [ ] Pricing Page Testing: Verify pricing plans display correctly with both real and fallback data

This approach would give you practical confidence in your applications without the time sink of comprehensive test suites.

- [x] **Completed Testing Tasks**
  - [x] Test email deliverability and template rendering ✅
  - [x] Test Edge Function authorization and error handling ✅
  - [x] Fix subscription plans test script ✅
  - [x] Create Stripe product configuration guide ✅
  - [x] Test pricing page with various Stripe configurations ✅
  - [x] Verify fallback plans display correctly when API fails ✅
  - [x] Create troubleshooting guide for pricing page issues ✅
  - [x] Test Stripe product retrieval with debug-stripe-products script ✅
  - [x] Verify Edge Function logs for proper plan processing ✅
  - [x] Test pricing page with real Stripe products ✅
