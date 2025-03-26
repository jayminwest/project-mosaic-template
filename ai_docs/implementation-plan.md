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

- [ ] **Checkout Session Implementation**
  - [ ] Update the checkout session creation to use real Stripe product IDs
    - Modify `supabase/functions/create-stripe-session/index.ts` to accept priceId parameter:
      ```typescript
      // Parse request body
      const { priceId, successUrl, cancelUrl } = requestData as {
        priceId?: string;
        successUrl?: string;
        cancelUrl?: string;
      };
      
      // Create Checkout session with the provided priceId
      const session = await stripe.checkout.sessions.create({
        customer: profile.stripe_customer_id,
        line_items: [
          {
            price: priceId || STRIPE_PRICE_ID,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: successUrl || defaultSuccessUrl,
        cancel_url: cancelUrl || defaultCancelUrl,
      });
      ```
    - Update `lib/payment/payment-service.ts` to pass priceId to the Edge Function:
      ```typescript
      async createCheckoutSession(accessToken: string, priceId?: string): Promise<PaymentResponse> {
        return this.withRetry(async () => {
          const response = await fetch(
            `${this.config.apiUrl}/functions/v1/create-stripe-session`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                priceId,
                successUrl: this.config.successUrl,
                cancelUrl: this.config.cancelUrl,
              }),
            }
          );
          // Process response...
        }, "createCheckoutSession");
      }
      ```
  - [ ] Implement proper error handling for checkout session creation
    - Add detailed error handling in `supabase/functions/create-stripe-session/index.ts`:
      ```typescript
      try {
        // Existing code...
      } catch (error) {
        console.error("Error in create-stripe-session:", error.message);
        return new Response(JSON.stringify({ 
          error: error.message,
          code: error.code || 'unknown_error',
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      ```
    - Enhance error handling in `lib/payment/payment-service.ts`:
      ```typescript
      private async withRetry<T>(operation: () => Promise<T>, operationName: string): Promise<T> {
        let lastError: any;
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
          try {
            return await operation();
          } catch (error: any) {
            console.warn(`Attempt ${attempt}/${this.maxRetries} failed for ${operationName}: ${error.message}`);
            lastError = error;
            
            if (attempt < this.maxRetries) {
              // Exponential backoff with jitter
              const delay = Math.min(Math.pow(2, attempt) * 100 + Math.random() * 100, 3000);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        }
        return this.handleError(lastError, operationName);
      }
      ```
  - [ ] Add success and cancel URL configuration
    - Update `supabase/functions/create-stripe-session/index.ts` to use custom URLs:
      ```typescript
      const originUrl = req.headers.get("origin") ?? "http://localhost:3000";
      const defaultSuccessUrl = `${originUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
      const defaultCancelUrl = `${originUrl}/checkout/cancel`;
      
      // Create Checkout session
      const session = await stripe.checkout.sessions.create({
        customer: profile.stripe_customer_id,
        line_items: [
          {
            price: priceId || STRIPE_PRICE_ID,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: successUrl || defaultSuccessUrl,
        cancel_url: cancelUrl || defaultCancelUrl,
      });
      ```
    - Add configuration options in `lib/payment/payment-service.ts`:
      ```typescript
      export interface PaymentServiceConfig {
        apiUrl?: string;
        successUrl?: string;
        cancelUrl?: string;
        maxRetries?: number;
      }
      
      constructor(config: PaymentServiceConfig = {}) {
        this.config = {
          apiUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          successUrl: typeof window !== 'undefined' ? `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}` : '',
          cancelUrl: typeof window !== 'undefined' ? `${window.location.origin}/checkout/cancel` : '',
          ...config
        };
        this.maxRetries = config.maxRetries || 3;
      }
      ```
  - [ ] Create checkout success and cancel pages
    - Create `app/checkout/success/page.tsx`:
      ```tsx
      'use client';
      
      import { useEffect, useState } from 'react';
      import { useRouter, useSearchParams } from 'next/navigation';
      import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
      import { Button } from '@/components/ui/button';
      import { CheckCircle } from 'lucide-react';
      import { useSubscription } from '@/hooks/useSubscription';
      import { useConfig } from '@/lib/config/useConfig';
      
      export default function CheckoutSuccessPage() {
        const router = useRouter();
        const searchParams = useSearchParams();
        const sessionId = searchParams.get('session_id');
        const { productConfig } = useConfig();
        const { getSubscriptionStatus } = useSubscription();
        const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
        const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
        
        useEffect(() => {
          async function verifyCheckout() {
            if (!sessionId) {
              setStatus('error');
              return;
            }
            
            try {
              // Wait a moment to allow webhook processing
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              // Get updated subscription status
              const result = await getSubscriptionStatus();
              if (result.success) {
                setSubscriptionDetails(result.data);
                setStatus('success');
              } else {
                setStatus('error');
              }
            } catch (error) {
              console.error('Error verifying checkout:', error);
              setStatus('error');
            }
          }
          
          verifyCheckout();
        }, [sessionId, getSubscriptionStatus]);
        
        return (
          <div className="container max-w-md mx-auto py-12">
            <Card>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <CardTitle className="text-center text-2xl">Thank You!</CardTitle>
                <CardDescription className="text-center">
                  {status === 'loading' ? 'Verifying your subscription...' : 
                   status === 'success' ? 'Your subscription has been activated.' : 
                   'We received your payment.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {status === 'loading' && (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                )}
                
                {status === 'success' && subscriptionDetails && (
                  <div className="space-y-4">
                    <p className="text-center">
                      Welcome to {productConfig.name} {subscriptionDetails.planName}!
                    </p>
                    
                    {subscriptionDetails.trialEnd && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <p className="text-sm text-center">
                          Your free trial ends on {new Date(subscriptionDetails.trialEnd * 1000).toLocaleDateString()}.
                          You won't be charged until then.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {status === 'error' && (
                  <p className="text-center text-amber-600 dark:text-amber-400">
                    We're still processing your subscription. You'll receive an email confirmation shortly.
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button onClick={() => router.push('/dashboard')}>
                  Go to Dashboard
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
      }
      ```
    - Create `app/checkout/cancel/page.tsx`:
      ```tsx
      'use client';
      
      import { useRouter } from 'next/navigation';
      import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
      import { Button } from '@/components/ui/button';
      import { XCircle } from 'lucide-react';
      import { useConfig } from '@/lib/config/useConfig';
      
      export default function CheckoutCancelPage() {
        const router = useRouter();
        const { productConfig } = useConfig();
        
        return (
          <div className="container max-w-md mx-auto py-12">
            <Card>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <XCircle className="h-16 w-16 text-amber-500" />
                </div>
                <CardTitle className="text-center text-2xl">Checkout Cancelled</CardTitle>
                <CardDescription className="text-center">
                  Your subscription has not been processed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center">
                  You can try again whenever you're ready to upgrade to {productConfig.name} premium features.
                </p>
              </CardContent>
              <CardFooter className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => router.push('/')}>
                  Back to Home
                </Button>
                <Button onClick={() => router.push('/pricing')}>
                  View Plans
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
      }
      ```
  - [ ] Implement webhook handling for checkout session completion
    - Update `supabase/functions/stripe-webhook/index.ts` to handle trial periods:
      ```typescript
      case "checkout.session.completed": {
        const session = event.data.object;
        
        // Get the line items to find the price ID
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        if (lineItems.data.length > 0) {
          const priceId = lineItems.data[0].price?.id;
          
          // Get the plan type from the price ID, default to "premium" if not found
          const planType = priceId && priceToPlanMap.has(priceId) 
            ? priceToPlanMap.get(priceId) 
            : "premium";
          
          // Get subscription details to check for trial period
          const subscriptions = await stripe.subscriptions.list({
            customer: session.customer,
            limit: 1,
          });
          
          const subscription = subscriptions.data[0];
          const isTrialing = subscription?.status === 'trialing';
          
          await supabase
            .from("profiles")
            .update({
              subscription_plan: planType,
              subscription_status: subscription?.status || 'active',
              subscription_trial_end: subscription?.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_customer_id", session.customer);
          
          console.log(`Updated user to plan: ${planType} for customer: ${session.customer}, trial: ${isTrialing}`);
        }
        break;
      }
      ```
  - [ ] Add subscription status checking after checkout
    - Update `hooks/useSubscription.ts` to include trial information:
      ```typescript
      const getSubscriptionStatus = useCallback(async () => {
        if (!user?.user_id) return { success: false, error: 'User not authenticated' };
        
        try {
          setIsLoading(true);
          
          const { data, error } = await supabase.functions.invoke('subscription-status', {
            body: { userId: user.user_id },
          });
          
          if (error) {
            throw new Error(error.message);
          }
          
          setSubscriptionStatus(data);
          return { success: true, data };
        } catch (error: any) {
          console.error("Error getting subscription status:", error);
          return { success: false, error: error.message };
        } finally {
          setIsLoading(false);
        }
      }, [user, supabase]);
      
      // Helper functions for trial periods
      const isInTrialPeriod = useCallback(() => {
        return subscriptionStatus?.status === 'trialing';
      }, [subscriptionStatus]);
      
      const getTrialEndDate = useCallback(() => {
        if (!subscriptionStatus?.trialEnd) return null;
        return new Date(subscriptionStatus.trialEnd * 1000);
      }, [subscriptionStatus]);
      ```
    - Update `types/subscription.ts` to include trial information:
      ```typescript
      export interface SubscriptionStatus {
        active: boolean;
        status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
        planType: string;
        planName: string;
        currentPeriodEnd: number;
        cancelAtPeriodEnd: boolean;
        trialEnd: number | null;
        isTrialing: boolean;
        priceId: string;
        interval: string;
        currency: string;
        amount: number;
      }
      ```
  - [ ] Test checkout flow with real Stripe products
    - Create `scripts/test-checkout-flow.ts`:
      ```typescript
      import chalk from 'chalk';
      import { createClient } from '@supabase/supabase-js';
      import Stripe from 'stripe';
      import dotenv from 'dotenv';
      import path from 'path';
      
      // Load environment variables
      dotenv.config({ path: path.join(process.cwd(), '.env.local') });
      
      const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      
      const stripe = new Stripe(STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
      });
      
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      
      async function testCheckoutFlow() {
        console.log(chalk.blue('Project Mosaic - Test Checkout Flow'));
        console.log(chalk.gray('This tool will test your checkout flow with trial periods'));
        
        // Check if required environment variables are set
        if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
          console.log(chalk.red('Missing required environment variables'));
          console.log(chalk.gray('Please ensure STRIPE_SECRET_KEY, NEXT_PUBLIC_SUPABASE_URL, and NEXT_PUBLIC_SUPABASE_ANON_KEY are set'));
          return;
        }
        
        try {
          // 1. Check if Stripe products are configured with trial periods
          console.log(chalk.blue('\n1. Checking Stripe products configuration...'));
          
          const products = await stripe.products.list({
            active: true,
            expand: ['data.default_price'],
          });
          
          if (products.data.length === 0) {
            console.log(chalk.red('No active products found in your Stripe account'));
            console.log(chalk.gray('Please run npm run setup-subscription-plans to create products'));
            return;
          }
          
          console.log(chalk.green(`Found ${products.data.length} active products`));
          
          for (const product of products.data) {
            const price = product.default_price as Stripe.Price;
            const trialDays = product.metadata?.trial_period_days;
            
            console.log(chalk.white(`\nProduct: ${product.name}`));
            console.log(chalk.gray(`ID: ${product.id}`));
            console.log(chalk.gray(`Price ID: ${price?.id || 'No default price'}`));
            console.log(chalk.gray(`Plan Type: ${product.metadata?.plan_type || 'Not set'}`));
            
            if (trialDays) {
              console.log(chalk.green(`Trial Period: ${trialDays} days`));
            } else {
              console.log(chalk.yellow('Trial Period: Not configured'));
            }
          }
          
          // 2. Test Edge Functions
          console.log(chalk.blue('\n2. Testing Edge Functions...'));
          
          // Test list-subscription-plans
          console.log(chalk.gray('\nTesting list-subscription-plans function...'));
          const { data: plansData, error: plansError } = await supabase.functions.invoke('list-subscription-plans');
          
          if (plansError) {
            console.log(chalk.red(`Error: ${plansError.message}`));
          } else {
            console.log(chalk.green(`Success! Found ${plansData.plans.length} subscription plans`));
          }
          
          // 3. Provide checkout test instructions
          console.log(chalk.blue('\n3. Testing Checkout Flow'));
          console.log(chalk.gray('To test the complete checkout flow:'));
          console.log(chalk.white('1. Sign up for an account or log in'));
          console.log(chalk.white('2. Visit the pricing page'));
          console.log(chalk.white('3. Click on a subscription plan'));
          console.log(chalk.white('4. Complete the checkout process with test card details:'));
          console.log(chalk.gray('   - Card number: 4242 4242 4242 4242'));
          console.log(chalk.gray('   - Expiry: Any future date'));
          console.log(chalk.gray('   - CVC: Any 3 digits'));
          
        } catch (error) {
          console.error(chalk.red('Error testing checkout flow:'), error);
        }
      }
      
      testCheckoutFlow();
      ```
    - Add to `package.json`:
      ```json
      "scripts": {
        "test-checkout": "NODE_OPTIONS='--experimental-specifier-resolution=node' ts-node --esm --skipProject scripts/test-checkout-flow.ts"
      }
      ```
    - Create database migration for subscription status in `supabase/migrations/40_subscription_status.sql`:
      ```sql
      -- Add subscription status fields to profiles table
      ALTER TABLE public.profiles
      ADD COLUMN IF NOT EXISTS subscription_status TEXT,
      ADD COLUMN IF NOT EXISTS subscription_trial_end TIMESTAMP WITH TIME ZONE;
      
      -- Create index for faster subscription queries
      CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status
      ON public.profiles(subscription_status);
      ```
    - Update `scripts/setup-subscription-plans.ts` to include trial period configuration:
      ```typescript
      // Ask about trial period
      const { addTrialPeriod } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'addTrialPeriod',
          message: 'Would you like to add a free trial period?',
          default: true,
        }
      ]);
      
      let trialPeriodDays = 0;
      if (addTrialPeriod) {
        const { trialDays } = await inquirer.prompt([
          {
            type: 'number',
            name: 'trialDays',
            message: 'How many days for the trial period?',
            default: 7,
            validate: (input) => input > 0 ? true : 'Trial period must be at least 1 day'
          }
        ]);
        
        trialPeriodDays = trialDays;
      }
      
      // When creating the product, add trial_period_days to metadata
      const productMetadata = {
        plan_type: plan.planType,
        features: plan.features.map(f => f.description).join(', '),
        ...plan.limits.reduce((acc, limit) => ({
          ...acc,
          [`limit_${limit.name}`]: limit.value.toString(),
        }), {}),
        ...(trialPeriodDays > 0 ? { trial_period_days: trialPeriodDays.toString() } : {})
      };
      ```

- [ ] **A/B Testing Service Layer**
  - [ ] Create core types and service interface for A/B testing
  - [ ] Implement Supabase provider for self-hosted A/B testing
  - [ ] Create React hook and component for easy integration
  - [ ] Add Supabase database migrations for A/B testing tables
  - [ ] Integrate with service provider architecture
  - [ ] Create admin dashboard for managing tests
  - [ ] Add documentation and examples

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
