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

This will send a test email to an address you specify. The test script uses a simple HTML email to verify your configuration without requiring the React Email templates.

## Email Service Architecture

The email service is designed with a provider-agnostic approach:

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

## Email Templates

Email templates are built with React Email and located in `lib/email/templates/components/`:

- `WelcomeEmail.tsx` - Sent when a user signs up
- `PasswordResetEmail.tsx` - Sent when a user requests a password reset
- `VerificationEmail.tsx` - Sent to verify a user's email address
- `InvitationEmail.tsx` - Sent when inviting a user to the platform

To create a new email template:
1. Create a new React component in the templates directory
2. Add it to the `emailTemplates` object in `lib/email/templates/index.ts`
3. Use it with the email service

## Customizing Email Content

You can customize the email content by modifying the React components in the templates directory. Each template accepts props that can be used to personalize the content.

## Using the Email Service

The email service provides a simple interface for sending emails:

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

## Integration with Auth System

The email service is integrated with the authentication system through helper functions in `lib/auth/auth-emails.ts`:

```typescript
// Send a welcome email to a new user
await sendWelcomeEmail(user.email, user.name, productConfig.name);

// Send a password reset email
await sendPasswordResetEmail(email, resetLink, productConfig.name);

// Send an email verification link
await sendVerificationEmail(email, verificationLink, productConfig.name);
```

## Troubleshooting

If you encounter issues with email delivery:

1. Verify your Resend API key is correct
2. Check that your `EMAIL_FROM` address is properly configured
3. If using a custom domain, ensure DNS records are properly set up
4. Run the test email script to verify basic functionality
5. Check Resend's dashboard for delivery status and logs

## Best Practices

1. **Use Templates**: Always use the provided templates for consistent branding
2. **Personalize Content**: Include the user's name and relevant information
3. **Test Thoroughly**: Send test emails to verify templates render correctly
4. **Monitor Deliverability**: Check bounce rates and spam complaints
5. **Respect Privacy**: Always include an unsubscribe option in marketing emails
