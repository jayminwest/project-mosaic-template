import WelcomeEmail from './components/WelcomeEmail.tsx';
import PasswordResetEmail from './components/PasswordResetEmail.tsx';
import VerificationEmail from './components/VerificationEmail.tsx';
import InvitationEmail from './components/InvitationEmail.tsx';

export const emailTemplates = {
  welcome: WelcomeEmail,
  passwordReset: PasswordResetEmail,
  verification: VerificationEmail,
  invitation: InvitationEmail
};

export type EmailTemplateType = keyof typeof emailTemplates;
