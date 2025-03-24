# Email Integration

This tutorial explains how to set up and use the email service in Project Mosaic.

## Overview

Project Mosaic includes a complete email service built on [Resend](https://resend.com) and [React Email](https://react.email). This service allows you to send transactional emails like welcome messages, password resets, and verification emails with beautiful, responsive templates.

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

### 3. Test Your Configuration

After setup, you can test your email configuration:

```bash
npm run test-email
```

This will send a test email to an address you specify.

## Email Templates

Project Mosaic includes several pre-built email templates:

- **Welcome Email**: Sent when a user signs up
- **Password Reset**: Sent when a user requests a password reset
- **Email Verification**: Sent to verify a user's email address
- **Invitation Email**: Sent when inviting a user to the platform

These templates are built with React Email and located in `lib/email/templates/components/`.

## Using the Email Service

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

### Integration with Auth System

The email service is integrated with the authentication system through helper functions in `lib/auth/auth-emails.ts`:

```typescript
// Send a welcome email to a new user
await sendWelcomeEmail(user.email, user.name, productConfig.name);

// Send a password reset email
await sendPasswordResetEmail(email, resetLink, productConfig.name);

// Send an email verification link
await sendVerificationEmail(email, verificationLink, productConfig.name);
```

## Creating Custom Templates

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

## Customizing for Your Product

When adapting Project Mosaic for your specific product:

1. **Update Email Templates**: Modify the React Email components to match your branding
2. **Configure From Address**: Set the `EMAIL_FROM` environment variable to your domain
3. **Add Product-Specific Emails**: Create new templates for your product's unique needs
4. **Integrate with User Flows**: Add email sending at appropriate points in your user journey

## Best Practices

1. **Use Templates Consistently**: Maintain consistent branding across all email templates
2. **Personalize Content**: Always include the recipient's name when available
3. **Test Thoroughly**: Send test emails to verify templates render correctly
4. **Monitor Deliverability**: Check bounce rates and spam complaints
5. **Respect Privacy**: Always include an unsubscribe option in marketing emails

## Troubleshooting

If you encounter issues with email delivery:

1. Verify your Resend API key is correct
2. Check that your `EMAIL_FROM` address is properly configured
3. If using a custom domain, ensure DNS records are properly set up
4. Run the test email script to verify basic functionality
5. Check Resend's dashboard for delivery status and logs

## Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [React Email Documentation](https://react.email/docs)
- [Project Mosaic Email Service Guide](../ai_docs/email-service-guide.md)
- [Email Configuration Documentation](../ai_docs/email-configuration.md)
