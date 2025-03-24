import WelcomeEmail from './components/WelcomeEmail.js';
import PasswordResetEmail from './components/PasswordResetEmail.js';
import VerificationEmail from './components/VerificationEmail.js';
import InvitationEmail from './components/InvitationEmail.js';

export const emailTemplates = {
  welcome: WelcomeEmail,
  passwordReset: PasswordResetEmail,
  verification: VerificationEmail,
  invitation: InvitationEmail
};

export type EmailTemplateType = keyof typeof emailTemplates;
