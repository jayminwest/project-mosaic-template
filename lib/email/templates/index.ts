// Import React components directly
import { default as WelcomeEmail } from './components/WelcomeEmail';
import { default as PasswordResetEmail } from './components/PasswordResetEmail';
import { default as VerificationEmail } from './components/VerificationEmail';
import { default as InvitationEmail } from './components/InvitationEmail';
import { default as CancellationEmail } from './components/CancellationEmail';

export const emailTemplates = {
  welcome: WelcomeEmail,
  passwordReset: PasswordResetEmail,
  verification: VerificationEmail,
  invitation: InvitationEmail,
  cancellation: CancellationEmail
};

export type EmailTemplateType = keyof typeof emailTemplates;
