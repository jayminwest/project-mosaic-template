# Project Mosaic: Micro-SaaS Template Framework

A framework for rapidly developing profitable micro-SaaS products with Next.js, Supabase, and AI integration. Project Mosaic enables you to build and launch niche SaaS products in 1-2 weeks.

## 🚀 Overview

Project Mosaic is designed to accelerate the development of micro-SaaS products by providing:

- **Provider-agnostic AI integration** supporting multiple AI services (OpenAI, Anthropic)
- **Ready-to-use marketing components** for quick landing page creation
- **Built-in subscription system** with Stripe integration and usage limits
- **White-labeling capabilities** for easy customization
- **Transactional email system** with React Email templates
- **Configuration system** for rapid product setup

## 🛠️ Core Features

- **AI Service Abstraction Layer**: Switch between AI providers seamlessly
- **Email Service Layer**: Send transactional emails with React Email templates
- **Subscription Management**: Multiple pricing tiers with usage limits
- **White-Labeling System**: Customize branding and appearance
- **Configuration System**: Centralized product configuration

## 🧰 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **AI Integration**: OpenAI, Anthropic, with fallback mechanisms
- **Payments**: Stripe subscription system
- **Email**: Resend with React Email templates

## 🏁 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase CLI
- Stripe CLI (optional)
- Account credentials for:
  - Supabase
  - Resend (for email)
  - OpenAI and/or Anthropic (optional)
  - Stripe (for subscriptions)

### Initial Setup

1. Clone and install dependencies:

```bash
npm install
```

2. Create environment files:
```bash
cp .env.example .env.local
cp .env.example .env.test.local
```

3. Run the configuration setup:
```bash
npm run init-config
```

4. Set up email service:
```bash
npm run setup-email
```

5. Run development server:
```bash
npm run dev
# Visit http://localhost:3000
```

### Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Link your project:
```bash
supabase init
supabase link --project-ref your-project-ref
```

3. Apply database migrations:
```bash
supabase db push
```

4. Deploy edge functions:
```bash
supabase functions deploy ai-service
supabase functions deploy create-stripe-session
supabase functions deploy list-subscription-plans
supabase functions deploy stripe-webhook
```

5. Disable JWT verification for the webhook function:
   - Go to Supabase Dashboard → Edge Functions → stripe-webhook → Details
   - Disable "Enforce JWT Verification"

### Environment Variables

Required environment variables for `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com
```

Set Supabase secrets for edge functions:

```bash
supabase secrets set OPENAI_API_KEY="sk-xxx..."
supabase secrets set ANTHROPIC_API_KEY="sk-ant-xxx..."
supabase secrets set STRIPE_SECRET_KEY="sk_test_xxx"
supabase secrets set STRIPE_WEBHOOK_SECRET="whsec_xxx"
```

## 📚 Documentation

Comprehensive documentation is available in the repository:

- **Architecture**: [ai_docs/architecture.md](ai_docs/architecture.md)
- **Customization Guide**: [ai_docs/customization.md](ai_docs/customization.md)
- **Email Configuration**: [ai_docs/email-configuration.md](ai_docs/email-configuration.md)
- **Project Overview**: [ai_docs/PROJECT_MOSAIC_OVERVIEW.md](ai_docs/PROJECT_MOSAIC_OVERVIEW.md)

## 📋 Tutorials

Step-by-step tutorials for implementing specific features:

- **Database Setup**: [tutorial/1_CRUD.md](tutorial/1_CRUD.md)
- **Authentication**: [tutorial/2_AUTH.md](tutorial/2_AUTH.md)
- **Storage**: [tutorial/3_STORAGE.md](tutorial/3_STORAGE.md)
- **AI Integration**: [tutorial/4_EDGE_FUNCTION.md](tutorial/4_EDGE_FUNCTION.md)
- **Usage Limits**: [tutorial/5_USAGE_LIMITS.md](tutorial/5_USAGE_LIMITS.md)
- **Stripe Setup**: [tutorial/6A_STRIPE_SETUP.md](tutorial/6A_STRIPE_SETUP.md)
- **Stripe Integration**: [tutorial/6B_STRIPE_INTEGRATION.md](tutorial/6B_STRIPE_INTEGRATION.md)
- **Email Integration**: [tutorial/7_EMAIL_INTEGRATION.md](tutorial/7_EMAIL_INTEGRATION.md)
- **Configuration System**: [tutorial/8_CONFIGURATION_SYSTEM.md](tutorial/8_CONFIGURATION_SYSTEM.md)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test tests/integration/02_auth.test.ts
```

## 📁 Project Structure

```
project-mosaic/
├── ai_docs/           # AI-optimized documentation
├── app/               # Next.js app router pages
├── components/        # UI Components
├── hooks/             # Core service hooks
├── lib/               # Core libraries and services
│   ├── ai/            # AI service abstraction
│   ├── auth/          # Auth service
│   ├── config/        # Configuration system
│   ├── email/         # Email service
│   └── payment/       # Payment service
├── supabase/
│   ├── functions/     # Edge Functions
│   └── migrations/    # Database migrations
├── tests/             # Test suites
└── tutorial/          # Implementation guides
```

## 📄 License

This project is proprietary.
