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

- [ ] **Core Project Structure**
  - [ ] Create core directories for the new architecture:
    - `/lib/ai` - AI service abstraction
    - `/lib/config` - Configuration system
    - `/lib/email` - Email service system
    - `/components/marketing` - Marketing components
    - `/components/analytics` - Analytics components
  - [ ] Set up configuration system for project customization
  - [ ] Update environment variable structure with better documentation
  - [ ] Create placeholder dashboard page

## Phase 2: Essential Service Layers

- [ ] **AI Service Layer**
  - [ ] Create `/lib/ai/core/types.ts` with base interfaces
  - [ ] Create `/lib/ai/core/ai-service.ts` with provider-agnostic interface
  - [ ] Implement `/lib/ai/providers/openai.ts` provider
  - [ ] Create basic prompt management system in `/lib/ai/prompts/index.ts`
  - [ ] Create new generic AI edge function template

- [ ] **Email Service Layer**
  - [ ] Install required packages (resend, react-email, @react-email/components)
  - [ ] Create `/lib/email/email-service.ts` with provider-agnostic interface
  - [ ] Create `/lib/email/templates/index.ts` for template management
  - [ ] Implement basic email templates:
    - `/lib/email/templates/components/WelcomeEmail.tsx`
    - `/lib/email/templates/components/PasswordResetEmail.tsx`
    - `/lib/email/templates/components/VerificationEmail.tsx`
  - [ ] Create `/lib/auth/auth-emails.ts` to integrate with auth system
  - [ ] Update auth hooks to use the email service
  - [ ] Create setup scripts:
    - `/scripts/setup-email.ts` - Interactive email configuration
    - `/scripts/test-email.ts` - Email testing utility
  - [ ] Update documentation in ai_docs/ and tutorial/ to include email setup

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

- [ ] **Documentation**
  - [ ] Create architecture overview documentation
  - [ ] Add getting started guide
  - [ ] Develop GLOSSARY.md for quick reference
  - [ ] Create email configuration documentation
  - [ ] Update tutorial files with email setup instructions

- [ ] **Developer Tools**
  - [ ] Create setup script for initial project configuration
  - [ ] Add deployment automation script
  - [ ] Create customization guide with examples
  - [ ] Add email testing and configuration scripts

## Testing & Validation

- [ ] **Core Testing**
  - [ ] Create template-agnostic test utilities
  - [ ] Implement tests for core services (AI, Auth, Email, Storage, Payments)
  - [ ] Test with different product types as examples

- [ ] **Quality Assurance**
  - [ ] Verify performance metrics
  - [ ] Test accessibility compliance
  - [ ] Perform security audit
  - [ ] Test email deliverability and template rendering
