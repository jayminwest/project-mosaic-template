# Project Mosaic Architecture

This document outlines the architecture of Project Mosaic, a framework designed for rapid development of micro-SaaS products.

## System Overview

Project Mosaic is built on a modular architecture that enables quick adaptation for different product types while maintaining a consistent foundation. The system is designed with an AI-first approach, integrating AI capabilities throughout the product lifecycle.

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Frontend                        │
├─────────────┬─────────────┬────────────────┬───────────────┤
│  Marketing  │  Product    │  Analytics     │  Admin        │
│  Components │  Features   │  Dashboard     │  Interface    │
├─────────────┴─────────────┴────────────────┴───────────────┤
│                    Core Service Layer                       │
├─────────────┬─────────────┬────────────────┬───────────────┤
│  Auth       │  AI         │  Subscription  │  Storage      │
│  Service    │  Service    │  Service       │  Service      │
├─────────────┴─────────────┴────────────────┴───────────────┤
│                      Supabase Backend                       │
├─────────────┬─────────────┬────────────────┬───────────────┤
│  Database   │  Auth       │  Edge          │  Storage      │
│  (Postgres) │  Provider   │  Functions     │  Buckets      │
└─────────────┴─────────────┴────────────────┴───────────────┘
```

## Key Components

### 1. Configuration System

The Configuration System provides a centralized way to manage product settings, theme customization, and feature flags:

```
┌─────────────────────────────────────────────────────────────┐
│                  Configuration System                       │
├─────────────┬─────────────┬────────────────┬───────────────┤
│  Product    │  Theme      │  Subscription  │  Feature      │
│  Settings   │  Config     │  Plans         │  Flags        │
├─────────────┴─────────────┴────────────────┴───────────────┤
│                    Environment Validation                   │
├─────────────┬─────────────┬────────────────┬───────────────┤
│  Required   │  Optional   │  Validation    │  Default      │
│  Variables  │  Variables  │  Logic         │  Values       │
└─────────────┴─────────────┴────────────────┴───────────────┘
```

The Configuration System has been implemented with:
- Type definitions in `lib/config/types.ts` with interfaces for ProductConfig, ThemeConfig, SubscriptionPlan, and FeatureFlags
- Product configuration in `lib/config/default-config.ts` with customizable product settings
- Theme settings in `lib/config/theme.ts` with comprehensive color schemes for light/dark modes
- Subscription plans in `lib/config/subscription.ts` with free and premium tier definitions
- Feature flags in `lib/config/features.ts` for enabling/disabling functionality
- Environment validation in `lib/config/environment.ts` with detailed validation reporting
- React hook for accessing configuration in `lib/config/useConfig.ts` with helper functions
- Helper functions in `lib/config/index.ts` for common configuration tasks
- Setup scripts in `scripts/init-config.ts` for interactive setup and `scripts/quick-setup.ts` for rapid configuration

### 2. AI Service Abstraction Layer

The AI Service layer provides a provider-agnostic interface for integrating with multiple AI providers:

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Service Interface                     │
├─────────────┬─────────────┬────────────────┬───────────────┤
│  OpenAI     │  Anthropic  │  Local Models  │  Custom       │
│  Provider   │  Provider   │  Provider      │  Provider     │
├─────────────┴─────────────┴────────────────┴───────────────┤
│                    Prompt Management                        │
├─────────────┬─────────────┬────────────────┬───────────────┤
│  Templates  │  Versioning │  Testing       │  Optimization │
├─────────────┴─────────────┴────────────────┴───────────────┤
│                    Context Management                       │
└─────────────────────────────────────────────────────────────┘
```

### 2. Email Service Layer

The Email Service layer provides a clean interface for sending transactional emails:

```
┌─────────────────────────────────────────────────────────────┐
│                   Email Service Interface                   │
├─────────────────────────────────────────────────────────────┤
│                        Resend Provider                      │
├─────────────┬─────────────┬────────────────┬───────────────┤
│  Welcome    │  Password   │  Verification  │  Custom       │
│  Emails     │  Reset      │  Emails        │  Templates    │
├─────────────┴─────────────┴────────────────┴───────────────┤
│                    React Email Components                   │
└─────────────────────────────────────────────────────────────┘
```

The Email Service has been implemented with:
- A provider-agnostic interface in `lib/email/email-service.ts`
- React Email templates in `lib/email/templates/components/`
- Integration with the auth system via `lib/auth/auth-emails.ts`
- Configuration and testing utilities in `scripts/setup-email.ts` and `scripts/test-email.ts`

### 3. Marketing Components

Reusable components for quickly creating marketing pages and campaigns:

- Landing page sections
- Email templates
- Social media components
- SEO optimization tools
- A/B testing framework

### 4. Analytics & Metrics

Unified dashboard for tracking product performance:

- User engagement metrics
- Conversion funnel visualization
- Revenue tracking
- Churn analysis
- Marketing campaign ROI

### 5. Subscription Management

Flexible subscription system supporting multiple pricing tiers:

- Free tier with usage limits
- Multiple premium tiers
- Usage tracking and enforcement
- Upgrade/downgrade flows

## Data Flow

1. **User Authentication Flow**
   - Registration/Login via Supabase Auth
   - Profile creation and storage
   - Session management
   - Email verification and welcome emails

2. **Subscription Flow**
   - Tier selection
   - Stripe checkout integration
   - Webhook processing
   - Account updating

3. **AI Integration Flow**
   - Request preprocessing
   - Provider selection and fallback
   - Context management
   - Response processing

4. **Email Communication Flow**
   - Event triggers (signup, password reset, etc.)
   - Template selection and rendering
   - Personalization with user data
   - Delivery via Resend API

## Customization Points

Project Mosaic is designed to be easily customized for different product types:

1. **Product Features**
   - Core functionality components
   - Product-specific database schema
   - Custom API endpoints

2. **Branding**
   - Theme customization
   - Logo and imagery
   - Typography and colors
   - Email templates and styling

3. **AI Configuration**
   - Provider selection
   - Model configuration
   - Prompt templates

4. **Pricing Structure**
   - Tier definitions
   - Feature limitations
   - Usage quotas

## Deployment Architecture

```
┌─────────────────────┐      ┌─────────────────────┐
│   Vercel/Netlify    │      │      Supabase       │
│   ┌─────────────┐   │      │   ┌─────────────┐   │
│   │  Next.js    │   │      │   │  Database   │   │
│   │  Frontend   │◄──┼──────┼──►│  (Postgres) │   │
│   └─────────────┘   │      │   └─────────────┘   │
└─────────────────────┘      │   ┌─────────────┐   │
                             │   │    Auth     │   │
┌─────────────────────┐      │   └─────────────┘   │
│      Stripe         │      │   ┌─────────────┐   │
│   ┌─────────────┐   │      │   │   Storage   │   │
│   │  Payment    │◄──┼──────┼──►│   Buckets   │   │
│   │  Processing │   │      │   └─────────────┘   │
│   └─────────────┘   │      │   ┌─────────────┐   │
└─────────────────────┘      │   │    Edge     │   │
                             │   │  Functions  │   │
┌─────────────────────┐      │   └─────────────┘   │
│   AI Providers      │      └─────────────────────┘
│   ┌─────────────┐   │
│   │  OpenAI,    │◄──┼────┐
│   │  Anthropic  │   │    │
│   └─────────────┘   │    │
└─────────────────────┘    │
                           │
┌─────────────────────┐    │    ┌─────────────────────┐
│   Analytics         │    │    │   Email Service     │
│   ┌─────────────┐   │    │    │   ┌─────────────┐   │
│   │  Tracking   │◄───────┘    │   │   Resend    │   │
│   │  & Metrics  │   │         │   │   Provider  │◄──┼────┐
│   └─────────────┘   │         │   └─────────────┘   │    │
└─────────────────────┘         └─────────────────────┘    │
```

## Development Workflow

Project Mosaic is designed to support a rapid development workflow:

1. **Product Definition** (1-2 days)
   - Define core value proposition
   - Select product type template
   - Configure AI capabilities

2. **Customization** (2-3 days)
   - Implement micro-SaaS-specific features
   - Customize UI and branding
   - Configure pricing tiers

3. **Testing & Refinement** (1-2 days)
   - Automated testing
   - User flow validation
   - Performance optimization

4. **Launch** (1 day)
   - Deployment
   - Marketing setup
   - Analytics configuration

This architecture enables the development of complete micro-SaaS products in 1-2 weeks while maintaining high quality and scalability.
