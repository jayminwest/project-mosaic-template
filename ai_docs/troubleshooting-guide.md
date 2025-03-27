# Troubleshooting Guide

This guide provides solutions for common issues you might encounter when using Project Mosaic.

## AI Service Issues

### API Key Configuration

**Issue**: AI service returns "API key not configured" error.

**Solution**:
1. Check that you've set the appropriate environment variables:
   ```
   # For server-side usage
   OPENAI_API_KEY=your_openai_key
   ANTHROPIC_API_KEY=your_anthropic_key
   
   # For client-side usage
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key
   NEXT_PUBLIC_ANTHROPIC_API_KEY=your_anthropic_key
   ```

2. Run the setup script to configure AI keys:
   ```bash
   npm run setup-ai-keys
   ```

3. Verify the keys are correctly loaded:
   ```typescript
   // Check if keys are available in the environment
   console.log('OpenAI key available:', !!process.env.OPENAI_API_KEY);
   console.log('Anthropic key available:', !!process.env.ANTHROPIC_API_KEY);
   ```

### Provider Errors

**Issue**: AI requests fail with provider-specific errors.

**Solution**:
1. Check the provider's status page for service outages:
   - [OpenAI Status](https://status.openai.com/)
   - [Anthropic Status](https://status.anthropic.com/)

2. Verify your API key has sufficient quota/credits:
   - Check your usage in the provider's dashboard
   - Ensure billing information is up to date

3. Try using a different provider:
   ```typescript
   const { generateCompletion } = useAI();
   
   const response = await generateCompletion(
     messages,
     { provider: 'anthropic' } // Switch to Anthropic if OpenAI fails
   );
   ```

### Rate Limiting

**Issue**: AI requests fail with rate limit errors.

**Solution**:
1. Implement exponential backoff for retries:
   ```typescript
   const maxRetries = 3;
   let retries = 0;
   
   while (retries < maxRetries) {
     try {
       const response = await aiService.complete(options);
       return response;
     } catch (error) {
       if (error.message.includes('rate limit') && retries < maxRetries - 1) {
         retries++;
         const delay = Math.pow(2, retries) * 1000; // Exponential backoff
         await new Promise(resolve => setTimeout(resolve, delay));
       } else {
         throw error;
       }
     }
   }
   ```

2. Implement request throttling:
   ```typescript
   const queue = [];
   let processing = false;
   
   function enqueueRequest(request) {
     return new Promise((resolve, reject) => {
       queue.push({ request, resolve, reject });
       processQueue();
     });
   }
   
   async function processQueue() {
     if (processing || queue.length === 0) return;
     
     processing = true;
     const { request, resolve, reject } = queue.shift();
     
     try {
       const result = await request();
       resolve(result);
     } catch (error) {
       reject(error);
     } finally {
       processing = false;
       setTimeout(processQueue, 1000); // Rate limit to 1 request per second
     }
   }
   ```

## Email Service Issues

### Email Delivery Failures

**Issue**: Emails are not being delivered.

**Solution**:
1. Verify your Resend API key is correctly configured:
   ```
   RESEND_API_KEY=your_resend_api_key
   EMAIL_FROM=noreply@yourdomain.com
   ```

2. Run the email setup script:
   ```bash
   npm run setup-email
   ```

3. Test email delivery:
   ```bash
   npm run test-email
   ```

4. Check Resend dashboard for delivery status and logs.

5. Ensure your sender domain is properly configured:
   - Verify SPF, DKIM, and DMARC records
   - Check for domain verification in Resend dashboard

### Supabase Auth Emails

**Issue**: Supabase authentication emails are not being sent.

**Solution**:
1. Verify SMTP settings in Supabase dashboard:
   - Go to Project Settings > Auth > SMTP
   - Check that Host, Port, Username, and Password are correct

2. Test SMTP connection in Supabase dashboard.

3. Check email templates in Supabase dashboard:
   - Go to Authentication > Email Templates
   - Ensure templates are properly configured

4. Verify Resend SMTP credentials:
   - Check SMTP username and password in Resend dashboard
   - Ensure SMTP is enabled for your Resend account

## Subscription and Payment Issues

### Stripe Configuration

**Issue**: Subscription plans are not appearing or checkout fails.

**Solution**:
1. Verify Stripe API keys are correctly configured:
   ```
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ```

2. Run the subscription plans setup script:
   ```bash
   npm run setup-subscription-plans
   ```

3. Test subscription plans retrieval:
   ```bash
   npm run test-subscription-plans
   ```

4. Check Stripe product metadata:
   - Ensure each product has the `plan_type` metadata field
   - Valid values are exactly "free", "premium", or "enterprise"
   - Features should be defined as a comma-separated list or as individual feature_1, feature_2, etc.

5. Verify webhook configuration:
   ```bash
   npm run test-webhook
   ```

### Stripe Customer Portal

**Issue**: Stripe Customer Portal returns "No configuration provided" error.

**Solution**:
1. Configure the Customer Portal in Stripe dashboard:
   - Go to [https://dashboard.stripe.com/test/settings/billing/portal](https://dashboard.stripe.com/test/settings/billing/portal)
   - Configure basic settings
   - Click "Save" at the bottom of the page

2. Verify portal configuration:
   ```typescript
   try {
     // Create a test customer to check portal configuration
     const customer = await stripe.customers.create({
       email: 'test@example.com',
     });
     
     // Attempt to create a portal session
     await stripe.billingPortal.sessions.create({
       customer: customer.id,
       return_url: 'https://example.com',
     });
     
     console.log('Portal is configured correctly');
   } catch (error) {
     if (error.message.includes('No configuration provided')) {
       console.error('Stripe Customer Portal is not configured. Please set it up in your Stripe dashboard.');
     } else {
       console.error('Error checking portal configuration:', error.message);
     }
   }
   ```

### Webhook Authorization

**Issue**: Stripe webhook returns 401 Unauthorized errors.

**Solution**:
1. Disable JWT verification for webhook functions in `supabase/config.toml`:
   ```toml
   [functions.stripe-webhook]
   enabled = true
   verify_jwt = false

   [functions.stripe-webhook-test]
   enabled = true
   verify_jwt = false
   ```

2. Deploy the functions again:
   ```bash
   supabase functions deploy stripe-webhook
   supabase functions deploy stripe-webhook-test
   ```

3. Test with curl:
   ```bash
   curl -X POST https://YOUR-PROJECT-ID.supabase.co/functions/v1/stripe-webhook -H "Content-Type: application/json" -d '{"test": true}'
   ```

## Database and Supabase Issues

### Database Migrations

**Issue**: Database migrations fail to apply.

**Solution**:
1. Check migration files for syntax errors.

2. Apply migrations manually:
   ```bash
   npx supabase migration up
   ```

3. Verify migration status:
   ```bash
   npx supabase migration list
   ```

4. If a migration is stuck, you may need to manually fix it in the database:
   - Connect to the database using the Supabase dashboard SQL editor
   - Check the `schema_migrations` table
   - Update the status of problematic migrations

### RLS Policies

**Issue**: Users can't access their data or can access other users' data.

**Solution**:
1. Check RLS policies for the affected tables:
   ```sql
   -- Example policy for profiles table
   CREATE POLICY "Users can view their own profile"
     ON profiles FOR SELECT
     USING (auth.uid() = user_id);
   ```

2. Verify RLS is enabled for the table:
   ```sql
   ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
   ```

3. Test policies with different user contexts:
   ```sql
   -- Set the role to authenticated and a specific user ID
   SET LOCAL ROLE authenticated;
   SET LOCAL request.jwt.claim.sub TO 'user_id_here';
   
   -- Try to access data
   SELECT * FROM table_name;
   ```

## Environment and Configuration Issues

### Missing Environment Variables

**Issue**: Application fails with "Missing required environment variables" error.

**Solution**:
1. Check which variables are missing:
   ```typescript
   import { validateEnvironment } from '@/lib/config/environment';
   
   const { valid, missingRequired, missingOptional } = validateEnvironment();
   console.log('Missing required variables:', missingRequired);
   console.log('Missing optional variables:', missingOptional);
   ```

2. Add the missing variables to your `.env.local` file.

3. For deployment, add the variables to your hosting platform's environment settings.

### Feature Flags

**Issue**: Features are not enabled or disabled as expected.

**Solution**:
1. Check feature flags configuration:
   ```typescript
   import { featureFlags } from '@/lib/config/features';
   
   console.log('Feature flags:', featureFlags);
   ```

2. Use the `isFeatureEnabled` helper to check specific features:
   ```typescript
   import { useConfig } from '@/lib/config/useConfig';
   
   function MyComponent() {
     const { isFeatureEnabled } = useConfig();
     
     if (isFeatureEnabled('enableAI')) {
       // AI features are enabled
     }
   }
   ```

3. Update feature flags in `lib/config/features.ts`.

## React and Next.js Issues

### Hydration Errors

**Issue**: React hydration errors in the console.

**Solution**:
1. Use the `useEffect` hook to prevent hydration mismatches:
   ```typescript
   import { useState, useEffect } from 'react';
   
   function MyComponent() {
     const [isMounted, setIsMounted] = useState(false);
     
     useEffect(() => {
       setIsMounted(true);
     }, []);
     
     if (!isMounted) {
       return null; // or a loading skeleton
     }
     
     return <div>My component content</div>;
   }
   ```

2. Use the `useAI` hook only in client components:
   ```typescript
   'use client';
   
   import { useAI } from '@/lib/ai/hooks/useAI';
   
   export default function AIComponent() {
     const { generateCompletion } = useAI();
     // ...
   }
   ```

### Server Component Errors

**Issue**: "Unsupported Server Component type: undefined" errors.

**Solution**:
1. Add "use client" directive to components that use client-side hooks:
   ```typescript
   'use client';
   
   import { useState } from 'react';
   
   export default function ClientComponent() {
     const [state, setState] = useState(null);
     // ...
   }
   ```

2. Fix import issues with named vs default exports:
   ```typescript
   // Correct import for default export
   import Button from '@/components/ui/button';
   
   // Correct import for named export
   import { Button } from '@/components/ui/button';
   ```

3. Remove duplicate components in the component tree.

## Performance Issues

### Slow AI Responses

**Issue**: AI responses take too long to generate.

**Solution**:
1. Use smaller models for less complex tasks:
   ```typescript
   const { generateCompletion } = useAI();
   
   // Use a smaller, faster model for simple tasks
   const response = await generateCompletion(
     messages,
     { model: 'gpt-3.5-turbo' }
   );
   ```

2. Implement streaming for better user experience:
   ```typescript
   const { generateStreamingCompletion, streamingResult } = useAI();
   
   useEffect(() => {
     generateStreamingCompletion(messages);
   }, [messages]);
   
   return <div>{streamingResult || 'Generating...'}</div>;
   ```

3. Implement caching for common requests:
   ```typescript
   const cache = new Map();
   
   async function cachedCompletion(messages, config) {
     const key = JSON.stringify({ messages, config });
     
     if (cache.has(key)) {
       return cache.get(key);
     }
     
     const response = await aiService.complete({ messages, config });
     cache.set(key, response);
     
     return response;
   }
   ```

### Slow Page Loads

**Issue**: Pages take too long to load.

**Solution**:
1. Implement code splitting:
   ```typescript
   import dynamic from 'next/dynamic';
   
   const AIAssistant = dynamic(() => import('@/components/composed/AIAssistant'), {
     loading: () => <LoadingSkeleton type="card" />,
     ssr: false
   });
   ```

2. Use the `loading.tsx` pattern in Next.js:
   ```typescript
   // app/dashboard/loading.tsx
   export default function Loading() {
     return <LoadingSkeleton type="dashboard" />;
   }
   ```

3. Optimize images and assets:
   ```typescript
   import Image from 'next/image';
   
   function OptimizedImage() {
     return (
       <Image
         src="/large-image.jpg"
         width={800}
         height={600}
         alt="Description"
         priority={false}
         loading="lazy"
       />
     );
   }
   ```

## Deployment Issues

### Vercel Deployment Failures

**Issue**: Deployment fails on Vercel.

**Solution**:
1. Check build logs for specific errors.

2. Verify environment variables are set in Vercel dashboard.

3. Ensure dependencies are correctly specified in package.json.

4. Check for unsupported API usage in server components.

5. Test the build locally:
   ```bash
   npm run build
   ```

### Supabase Edge Function Deployment

**Issue**: Edge functions fail to deploy.

**Solution**:
1. Check for syntax errors in edge function code.

2. Verify Supabase CLI is correctly installed and authenticated:
   ```bash
   supabase login
   ```

3. Deploy functions individually:
   ```bash
   supabase functions deploy function-name
   ```

4. Check function logs:
   ```bash
   supabase functions logs function-name
   ```

5. Verify function configuration in `supabase/config.toml`.

## Getting Additional Help

If you're still experiencing issues:

1. Check the [GitHub repository](https://github.com/yourusername/project-mosaic) for open issues.

2. Search the documentation for similar problems.

3. Create a detailed bug report with:
   - Steps to reproduce the issue
   - Expected behavior
   - Actual behavior
   - Error messages and logs
   - Environment information (browser, OS, Node.js version)
