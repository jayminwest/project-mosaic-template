# Email Service Guide

This guide provides detailed information on how to use the email service in Project Mosaic.

## Overview

The email service in Project Mosaic provides a clean, provider-agnostic interface for sending transactional emails. It's built on top of Resend and React Email, offering a modern approach to email templates and delivery.

## Dual Email Architecture

Project Mosaic uses a dual approach for email:

```
┌─────────────────────────────────────────────────────────────┐
│                     Email Architecture                      │
├─────────────────────────────┬───────────────────────────────┤
│    Authentication Emails    │    Transactional Emails       │
│    (Supabase + Resend SMTP) │    (Custom Email Service)     │
├─────────────────────────────┼───────────────────────────────┤
│ - Signup verification       │ - Welcome emails              │
│ - Password reset            │ - Order confirmations         │
│ - Magic link login          │ - Notifications               │
│ - User invitations          │ - Marketing emails            │
└─────────────────────────────┴───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Resend Service                       │
├─────────────────────────────┬───────────────────────────────┤
│      SMTP Protocol          │         API                   │
│  (Used by Supabase Auth)    │  (Used by Email Service)      │
└─────────────────────────────┴───────────────────────────────┘
```

### Custom Email Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   EmailService Class                        │
├─────────────────────────────────────────────────────────────┤
│  - sendEmail(options: EmailOptions)                         │
│  - verifyConfiguration()                                    │
│  - addDomain(domain: string)                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Email Templates                           │
├─────────────┬─────────────┬────────────────┬───────────────┤
│  Welcome    │  Password   │  Verification  │  Invitation   │
│  Email      │  Reset      │  Email         │  Email        │
└─────────────┴─────────────┴────────────────┴───────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Resend API                                │
└─────────────────────────────────────────────────────────────┘
```

## Setup and Configuration

### Environment Variables

The email service requires the following environment variables:

```
RESEND_API_KEY=your_api_key_here
EMAIL_FROM=noreply@yourdomain.com
```

### Automatic Setup

Run the setup script to configure the email service:

```bash
npm run setup-email
```

This interactive script will:
1. Ask for your Resend API key
2. Verify the API key is valid
3. Help you set up a custom domain (optional)
4. Update your environment variables
5. Guide you through Supabase SMTP configuration (optional)

### Supabase SMTP Configuration

For authentication emails, you'll need to configure Supabase to use Resend as its SMTP provider:

1. Get your Resend SMTP credentials from the Resend dashboard:
   - Go to the Resend dashboard > SMTP section
   - Generate or view your SMTP credentials

2. In your Supabase dashboard:
   - Go to Project Settings > Auth > SMTP
   - Enable Custom SMTP
   - Enter the following details:
     - Host: smtp.resend.com
     - Port: 465
     - Username: Your Resend SMTP username (usually "resend")
     - Password: Your Resend SMTP password
     - Sender Name: Your product name
     - Sender Email: The email you configured in the setup script

3. Customize email templates in Supabase:
   - Go to Authentication > Email Templates
   - Customize the templates for confirmation, invitation, magic link, and reset password emails

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

### Basic Usage

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

### Email Options

The `sendEmail` method accepts the following options:

```typescript
interface EmailOptions {
  to: string | string[];        // Recipient email address(es)
  subject: string;              // Email subject
  template: EmailTemplateType;  // Template name (from templates/index.ts)
  props?: Record<string, any>;  // Data to pass to the template
  from?: string;                // Override default from address
  cc?: string | string[];       // CC recipients
  bcc?: string | string[];      // BCC recipients
  replyTo?: string;             // Reply-to address
}
```

### Available Templates

The following email templates are available:

1. **welcome** - Sent when a user signs up (after verification)
   ```typescript
   props: {
     username: string;
     productName: string;
     actionUrl: string;
   }
   ```

2. **passwordReset** - Alternative to Supabase's reset email
   ```typescript
   props: {
     resetLink: string;
     productName: string;
   }
   ```

3. **verification** - Alternative to Supabase's confirmation email
   ```typescript
   props: {
     verificationLink: string;
     productName: string;
   }
   ```

4. **invitation** - Alternative to Supabase's invitation email
   ```typescript
   props: {
     inviterName: string;
     inviteLink: string;
     productName: string;
   }
   ```

## Creating Custom Templates

### Custom React Email Templates

To create a new email template:

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

## Testing Email Functionality

### Testing Custom Email Service

To test your custom email service:

```bash
npm run test-email
```

This will send a test email to an address you specify.

### Testing Supabase Auth Emails

To test Supabase auth emails:

1. In the Supabase dashboard, go to Authentication > Email Templates
2. Click the "Send test email" button for the template you want to test
3. Enter a test email address
4. Check your inbox to verify the email was received

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

1. Use the `verifyConfiguration` method to check if your API key is valid:

```typescript
const isConfigured = await emailService.verifyConfiguration();
console.log(`Email service configured correctly: ${isConfigured}`);
```

2. Send a test email with minimal content:

```typescript
const result = await emailService.sendEmail({
  to: 'test@example.com',
  subject: 'Test Email',
  template: 'welcome',
  props: { username: 'Test', productName: 'Test Product', actionUrl: 'https://example.com' }
});
console.log(result);
```

3. Check other common issues:
   - Verify your Resend API key is correct
   - Check that your `EMAIL_FROM` address is properly configured
   - If using a custom domain, ensure DNS records are properly set up
   - Check spam/junk folders
   - Check Resend dashboard for delivery status

## Best Practices

1. **Maintain Consistent Branding**
   - Use similar styling between Supabase emails and your custom emails
   - Keep branding elements consistent across all communication

2. **Personalize Content**
   - Always include the recipient's name when available
   - Customize content based on user preferences or behavior

3. **Optimize for Mobile**
   - Ensure templates render well on mobile devices
   - Use responsive design principles

4. **Test Thoroughly**
   - Test emails in multiple email clients
   - Verify links and buttons work correctly
   - Check for spam triggers in your content

5. **Monitor Deliverability**
   - Track open and click rates
   - Monitor bounce rates and spam complaints
   - Adjust content based on performance metrics

6. **Respect Privacy**
   - Include unsubscribe options in marketing emails
   - Only send emails to users who have opted in
   - Comply with email regulations (GDPR, CAN-SPAM, etc.)

7. **Avoid Duplication**
   - Don't send duplicate emails from both Supabase and your custom service
   - Clearly define which system handles which types of emails
