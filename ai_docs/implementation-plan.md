# Project Mosaic Implementation Plan

This document outlines the step-by-step implementation plan for transforming the Task App into a template for Project Mosaic.

## Implementation Template: AI Service Layer

The AI Service Layer provides a provider-agnostic interface for integrating with multiple AI providers. This template shows how we implemented this service layer.

### Directory Structure
```
lib/ai/
├── core/
│   ├── ai-service.ts     # Main service class with provider-agnostic interface
│   └── types.ts          # Core interfaces and types
├── hooks/
│   └── useAI.ts          # React hook for using the AI service
├── providers/
│   ├── anthropic.ts      # Anthropic provider implementation
│   ├── local.ts          # Local fallback provider
│   └── openai.ts         # OpenAI provider implementation
└── prompts/
    └── index.ts          # Prompt management system
```

### Usage Patterns

1. **Basic usage with direct messages**:
```typescript
import { AIService } from '../lib/ai/core/ai-service';

const aiService = new AIService();
const result = await aiService.complete({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What are the benefits of TypeScript?' },
  ],
});
```

2. **Using the React hook**:
```typescript
import { useAI } from '../lib/ai/hooks/useAI';

function AIComponent() {
  const { 
    generateCompletion, 
    isLoading, 
    result 
  } = useAI();
  
  const handleClick = async () => {
    await generateCompletion([
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'What are the benefits of TypeScript?' },
    ]);
  };
  
  return (
    <div>
      <button onClick={handleClick} disabled={isLoading}>
        Generate
      </button>
      {isLoading ? <p>Loading...</p> : <p>{result}</p>}
    </div>
  );
}
```

3. **Using prompt templates**:
```typescript
import { PromptManager } from '../lib/ai/prompts';
import { AIService } from '../lib/ai/core/ai-service';

const promptManager = new PromptManager();
const aiService = new AIService();

const messages = promptManager.formatPrompt('content-generation', {
  count: 3,
  topic: 'artificial intelligence',
  style: 'educational',
});

const result = await aiService.complete({ messages });
```

4. **Streaming responses**:
```typescript
const aiService = new AIService();
await aiService.streamComplete(
  {
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Write a short poem about coding.' },
    ],
  },
  (chunk) => {
    // Process each chunk as it arrives
    console.log(chunk);
  }
);
```

### Key Features

- **Provider Abstraction**: Unified interface for multiple AI providers
- **Fallback Mechanism**: Automatic fallback to alternative providers if primary fails
- **Prompt Management**: Template system for managing and versioning prompts
- **Streaming Support**: Both streaming and non-streaming completion options
- **React Integration**: Custom hook for easy integration with React components

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
    - `/lib/ai` - AI service abstraction
    - `/lib/config` - Configuration system
    - `/lib/email` - Email service system ✅
    - `/components/marketing` - Marketing components
    - `/components/analytics` - Analytics components
  - [ ] Set up configuration system for project customization
  - [ ] Update environment variable structure with better documentation
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
  - [ ] Create setup script for initial project configuration
  - [ ] Add deployment automation script
  - [x] Create customization guide with examples ✅
  - [x] Add email testing and configuration scripts ✅

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
