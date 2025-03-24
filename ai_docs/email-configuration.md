# Email Configuration

This project uses Resend for sending transactional emails. Resend provides a modern API for sending emails with excellent deliverability.

## Automatic Setup

The easiest way to configure email is to use our setup script:

```bash
npm run setup-email
```

This interactive script will:
1. Ask for your Resend API key
2. Verify the API key is valid
3. Help you set up a custom domain (optional)
4. Update your environment variables

## Manual Setup

If you prefer to configure email manually:

1. Sign up for a Resend account at https://resend.com
2. Create an API key in the Resend dashboard
3. Add the following to your `.env.local` file:
   ```
   RESEND_API_KEY=your_api_key_here
   EMAIL_FROM=noreply@yourdomain.com
   ```

## Testing Email Functionality

To verify your email configuration is working:

```bash
npm run test-email
```

This will send a test email to an address you specify.

## Email Templates

Email templates are built with React Email and located in `lib/email/templates/components/`.

To create a new email template:
1. Create a new React component in the templates directory
2. Add it to the `emailTemplates` object in `lib/email/templates/index.ts`
3. Use it with the email service

## Customizing Email Content

You can customize the email content by modifying the React components in the templates directory. Each template accepts props that can be used to personalize the content.

## Using the Email Service

```typescript
import { emailService } from '../lib/email/email-service';

// Send a welcome email
await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to Our Product',
  template: 'welcome',
  props: {
    username: 'John',
    productName: 'Our Product',
    actionUrl: 'https://example.com/dashboard'
  }
});
```
