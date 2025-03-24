# Email Configuration

This project uses Resend for sending transactional emails. Resend provides a modern API for sending emails with excellent deliverability.

## Email Architecture

Project Mosaic uses a dual approach for email:

1. **Authentication Emails**: Handled by Supabase using Resend as the SMTP provider
2. **Transactional Emails**: Sent directly through the custom email service

This approach gives you the best of both worlds - easy setup for auth emails and full customization for your own transactional emails.

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
5. Guide you through Supabase SMTP configuration (optional)

## Manual Setup

If you prefer to configure email manually:

### 1. Resend API Setup

1. Sign up for a Resend account at https://resend.com
2. Create an API key in the Resend dashboard
3. Add the following to your `.env.local` file:
   ```
   RESEND_API_KEY=your_api_key_here
   EMAIL_FROM=noreply@yourdomain.com
   ```

### 2. Supabase SMTP Configuration

For authentication emails, configure Supabase to use Resend as its SMTP provider:

1. Get your Resend SMTP credentials from the Resend dashboard:
   - Go to the Resend dashboard > SMTP section
   - Generate or view your SMTP credentials

2. In your Supabase dashboard:
   - Go to Project Settings > Auth > SMTP
   - Enable Custom SMTP
   - Enter the following details:
     - Host: smtp.resend.com
     - Port: 465
     - Username: Your Resend SMTP username
     - Password: Your Resend SMTP password
     - Sender Name: Your product name
     - Sender Email: The email you configured in the setup script

3. Customize email templates in Supabase:
   - Go to Authentication > Email Templates
   - Customize the templates for confirmation, invitation, magic link, and reset password emails

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

### Custom Email Templates

Email templates for your transactional emails are built with React Email and located in `lib/email/templates/components/`:

- `WelcomeEmail.tsx` - Sent when a user signs up (after verification)
- `PasswordResetEmail.tsx` - Alternative to Supabase's reset email
- `VerificationEmail.tsx` - Alternative to Supabase's confirmation email
- `InvitationEmail.tsx` - Alternative to Supabase's invitation email

To create a new email template:
1. Create a new React component in the templates directory
2. Add it to the `emailTemplates` object in `lib/email/templates/index.ts`
3. Use it with the email service

### Supabase Email Templates

Supabase provides customizable templates for authentication-related emails:

- **Confirmation Email**: Sent when a user signs up to verify their email
- **Invitation Email**: Sent when inviting a user to your application
- **Magic Link Email**: Sent when a user requests a magic link login
- **Reset Password Email**: Sent when a user requests a password reset

These templates can be customized in the Supabase dashboard under Authentication > Email Templates.

## Customizing Email Content

You can customize the email content by modifying the React components in the templates directory. Each template accepts props that can be used to personalize the content.

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

The email service provides a simple interface for sending custom transactional emails:

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
// Send a welcome email to a new user after they've verified their email
await sendWelcomeEmail(user.email, user.name, productConfig.name);

// Send a custom password reset email (if not using Supabase's built-in one)
await sendPasswordResetEmail(email, resetLink, productConfig.name);

// Send a custom verification email (if not using Supabase's built-in one)
await sendVerificationEmail(email, verificationLink, productConfig.name);
```

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

## Best Practices

1. **Use Templates Consistently**: Maintain consistent branding across all email templates
2. **Personalize Content**: Include the user's name and relevant information
3. **Test Thoroughly**: Send test emails to verify templates render correctly
4. **Monitor Deliverability**: Check bounce rates and spam complaints
5. **Respect Privacy**: Always include an unsubscribe option in marketing emails
6. **Avoid Duplication**: Don't send duplicate emails from both Supabase and your custom service
