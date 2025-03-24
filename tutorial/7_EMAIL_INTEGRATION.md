# Email Integration

This tutorial explains how to set up and use the email service in Project Mosaic.

## Overview

Project Mosaic includes a complete email service built on [Resend](https://resend.com) and [React Email](https://react.email). This service allows you to send transactional emails like welcome messages, password resets, and verification emails with beautiful, responsive templates.

## Email Architecture

Project Mosaic uses a dual approach for email:

1. **Authentication Emails**: Handled by Supabase using Resend as the SMTP provider
2. **Transactional Emails**: Sent directly through the custom email service

This approach gives you the best of both worlds - easy setup for auth emails and full customization for your own transactional emails.

## Setup

### 1. Create a Resend Account

First, you'll need to create an account at [resend.com](https://resend.com) and get an API key.

### 2. Run the Setup Script

Project Mosaic includes an interactive setup script that will guide you through the configuration process:

```bash
npm run setup-email
```

This script will:
- Ask for your Resend API key
- Verify the API key is valid
- Help you set up a custom domain (optional)
- Update your environment variables
- Guide you through Supabase SMTP configuration (optional)

### 3. Configure Supabase SMTP (Optional but Recommended)

For the best user experience, configure Supabase to use Resend as its SMTP provider:

1. Get your Resend SMTP credentials from the Resend dashboard
2. In your Supabase dashboard, go to Project Settings > Auth > SMTP
3. Enable Custom SMTP and enter the credentials:
   - Host: smtp.resend.com
   - Port: 465
   - Username: Your Resend SMTP username
   - Password: Your Resend SMTP password
   - Sender Name: Your product name
   - Sender Email: The email you configured in the setup script

### 4. Customize Supabase Email Templates

In your Supabase dashboard:
1. Go to Authentication > Email Templates
2. Customize the templates for:
   - Confirmation emails
   - Invitation emails
   - Magic link emails
   - Reset password emails

### 5. Test Your Configuration

After setup, you can test your email configuration:

```bash
npm run test-email
```

This will send a test email to an address you specify.

## Email Templates

### Supabase Auth Email Templates

Supabase provides customizable templates for authentication-related emails:

- **Confirmation Email**: Sent when a user signs up to verify their email
- **Invitation Email**: Sent when inviting a user to your application
- **Magic Link Email**: Sent when a user requests a magic link login
- **Reset Password Email**: Sent when a user requests a password reset

These templates can be customized in the Supabase dashboard under Authentication > Email Templates.

### Custom Email Templates

For your own transactional emails, Project Mosaic includes several pre-built React Email templates:

- **Welcome Email**: Sent when a user signs up (after verification)
- **Password Reset**: Alternative to Supabase's reset email
- **Email Verification**: Alternative to Supabase's confirmation email
- **Invitation Email**: Alternative to Supabase's invitation email

These templates are built with React Email and located in `lib/email/templates/components/`.

## Using the Email Service

### When to Use Each Approach

- **Use Supabase Auth Emails for**:
  - Email verification during signup
  - Password reset requests
  - Magic link authentication
  - User invitations through Supabase

- **Use Custom Email Service for**:
  - Welcome emails after successful signup
  - Transactional emails (receipts, notifications)
  - Marketing emails
  - Custom workflows not handled by Supabase

### Basic Usage of Custom Email Service

```typescript
import { emailService } from '../lib/email/email-service';

// Send a welcome email
const result = await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to Our Product',
  template: 'welcome',
  props: {
    username: 'John',
    productName: 'Our Product',
    actionUrl: 'https://example.com/dashboard'
  }
});

if (result.success) {
  console.log(`Email sent successfully! Message ID: ${result.messageId}`);
} else {
  console.error(`Failed to send email: ${result.error}`);
}
```

### Integration with Auth System

The email service is integrated with the authentication system through helper functions in `lib/auth/auth-emails.ts`:

```typescript
// Send a welcome email to a new user after they've verified their email
await sendWelcomeEmail(user.email, user.name, productConfig.name);

// Send a custom password reset email (if not using Supabase's built-in one)
await sendPasswordResetEmail(email, resetLink, productConfig.name);

// Send a custom verification email (if not using Supabase's built-in one)
await sendVerificationEmail(email, verificationLink, productConfig.name);
```

### Example: Sending a Welcome Email After Verification

```typescript
// In your auth hook or callback handler
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    // User has completed email verification and signed in
    const { user } = session;
    
    // Send a welcome email
    sendWelcomeEmail(user.email, user.user_metadata.name || 'User', 'Your Product');
  }
});
```

## Creating Custom Templates

### Custom React Email Templates

To create a new email template for your custom email service:

1. Create a new React component in `lib/email/templates/components/`:

```tsx
// lib/email/templates/components/CustomEmail.tsx
import * as React from 'react';
import { 
  Html, Head, Body, Container, Section, 
  Text, Button, Heading, Link 
} from '@react-email/components';

interface CustomEmailProps {
  username: string;
  customData: string;
  actionUrl: string;
}

export default function CustomEmail({ 
  username = 'User',
  customData = 'Default data',
  actionUrl = 'https://example.com'
}: CustomEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif' }}>
        <Container>
          <Heading>Hello, {username}!</Heading>
          <Text>Here is your custom data: {customData}</Text>
          <Section>
            <Button href={actionUrl}>
              Take Action
            </Button>
          </Section>
          <Text>
            Best regards,<br />
            Your Product Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
```

2. Register the template in `lib/email/templates/index.ts`:

```typescript
import { default as WelcomeEmail } from './components/WelcomeEmail';
import { default as PasswordResetEmail } from './components/PasswordResetEmail';
import { default as VerificationEmail } from './components/VerificationEmail';
import { default as InvitationEmail } from './components/InvitationEmail';
import { default as CustomEmail } from './components/CustomEmail';

export const emailTemplates = {
  welcome: WelcomeEmail,
  passwordReset: PasswordResetEmail,
  verification: VerificationEmail,
  invitation: InvitationEmail,
  custom: CustomEmail  // Add your new template
};

export type EmailTemplateType = keyof typeof emailTemplates;
```

### Customizing Supabase Email Templates

To customize Supabase's built-in email templates:

1. Go to your Supabase dashboard
2. Navigate to Authentication > Email Templates
3. Select the template you want to customize
4. Edit the HTML content and subject line
5. Use the variables provided by Supabase (e.g., {{ .ConfirmationURL }})
6. Save your changes

## Customizing for Your Product

When adapting Project Mosaic for your specific product:

1. **Update Email Templates**: 
   - Modify the React Email components to match your branding
   - Customize Supabase email templates in the dashboard

2. **Configure From Address**: 
   - Set the `EMAIL_FROM` environment variable for your custom email service
   - Configure the sender email in Supabase SMTP settings

3. **Add Product-Specific Emails**: 
   - Create new templates for your product's unique needs
   - Integrate them at appropriate points in your user journey

4. **Maintain Consistency**: 
   - Use similar styling between Supabase emails and your custom emails
   - Keep branding elements consistent across all communication

## Best Practices

1. **Use Templates Consistently**: Maintain consistent branding across all email templates
2. **Personalize Content**: Always include the recipient's name when available
3. **Test Thoroughly**: Send test emails to verify templates render correctly
4. **Monitor Deliverability**: Check bounce rates and spam complaints
5. **Respect Privacy**: Always include an unsubscribe option in marketing emails
6. **Avoid Duplication**: Don't send duplicate emails from both Supabase and your custom service

## Troubleshooting

### Supabase Auth Emails

If Supabase auth emails aren't being delivered:

1. Verify your SMTP settings in the Supabase dashboard
2. Check that your Resend SMTP credentials are correct
3. Ensure your sender email domain has proper DNS records
4. Test the SMTP connection in the Supabase dashboard
5. Check Resend's dashboard for delivery status and logs

### Custom Email Service

If your custom emails aren't being delivered:

1. Verify your Resend API key is correct
2. Check that your `EMAIL_FROM` address is properly configured
3. If using a custom domain, ensure DNS records are properly set up
4. Run the test email script to verify basic functionality
5. Check Resend's dashboard for delivery status and logs

## Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [React Email Documentation](https://react.email/docs)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Project Mosaic Email Service Guide](../ai_docs/email-service-guide.md)
- [Email Configuration Documentation](../ai_docs/email-configuration.md)
