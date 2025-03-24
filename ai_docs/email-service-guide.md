# Email Service Guide

This guide provides detailed information on how to use the email service in Project Mosaic.

## Overview

The email service in Project Mosaic provides a clean, provider-agnostic interface for sending transactional emails. It's built on top of Resend and React Email, offering a modern approach to email templates and delivery.

## Architecture

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

1. **welcome** - Sent when a user signs up
   ```typescript
   props: {
     username: string;
     productName: string;
     actionUrl: string;
   }
   ```

2. **passwordReset** - Sent when a user requests a password reset
   ```typescript
   props: {
     resetLink: string;
     productName: string;
   }
   ```

3. **verification** - Sent to verify a user's email address
   ```typescript
   props: {
     verificationLink: string;
     productName: string;
   }
   ```

4. **invitation** - Sent when inviting a user to the platform
   ```typescript
   props: {
     inviterName: string;
     inviteLink: string;
     productName: string;
   }
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

3. Use the new template:

```typescript
await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Custom Email Subject',
  template: 'custom',
  props: {
    username: 'John',
    customData: 'Your special information',
    actionUrl: 'https://example.com/action'
  }
});
```

## Testing Email Templates

To test your email templates:

1. Run the test email script:

```bash
npm run test-email
```

2. For more comprehensive testing, you can create a test script that uses your custom templates:

```typescript
// scripts/test-custom-email.ts
import { emailService } from '../lib/email/email-service';
import inquirer from 'inquirer';
import chalk from 'chalk';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
if (fs.existsSync(path.join(process.cwd(), '.env.local'))) {
  dotenv.config({ path: path.join(process.cwd(), '.env.local') });
}

async function testCustomEmail() {
  console.log(chalk.blue('Custom Email Test'));
  
  // Get test email address
  const { email } = await inquirer.prompt([
    {
      type: 'input',
      name: 'email',
      message: 'Send test email to:',
      validate: (input) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) || 'Please enter a valid email'
    }
  ]);
  
  try {
    const result = await emailService.sendEmail({
      to: email,
      subject: 'Custom Email Test',
      template: 'custom',
      props: {
        username: 'Test User',
        customData: 'This is a test of the custom email template',
        actionUrl: 'https://example.com/test'
      }
    });
    
    if (result.success) {
      console.log(chalk.green('✓ Custom email sent successfully!'));
      console.log(chalk.gray(`Message ID: ${result.messageId}`));
    } else {
      console.log(chalk.red('Failed to send custom email'));
      console.log(chalk.gray(result.error));
    }
  } catch (error: any) {
    console.log(chalk.red('Error sending custom email:'));
    console.log(chalk.gray(error?.message || 'Unknown error occurred'));
  }
}

testCustomEmail().catch(console.error);
```

## Troubleshooting

### Common Issues

1. **API Key Invalid**
   - Verify your Resend API key is correct
   - Check that it's properly set in your .env.local file

2. **Email Not Delivered**
   - Check spam/junk folders
   - Verify recipient email address is valid
   - Check Resend dashboard for delivery status

3. **Template Rendering Issues**
   - Ensure all required props are provided
   - Check for syntax errors in the template
   - Test with simplified HTML to isolate the issue

### Debugging

To debug email issues:

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

## Best Practices

1. **Use Templates Consistently**
   - Maintain consistent branding across all email templates
   - Use the same color scheme, logo, and typography

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
