import WelcomeEmail from './components/WelcomeEmail';
import PasswordResetEmail from './components/PasswordResetEmail';
import VerificationEmail from './components/VerificationEmail';
import InvitationEmail from './components/InvitationEmail';

export const emailTemplates = {
  welcome: WelcomeEmail,
  passwordReset: PasswordResetEmail,
  verification: VerificationEmail,
  invitation: InvitationEmail
};

export type EmailTemplateType = keyof typeof emailTemplates;
