import WelcomeEmail from './components/WelcomeEmail.jsx';
import PasswordResetEmail from './components/PasswordResetEmail.jsx';
import VerificationEmail from './components/VerificationEmail.jsx';
import InvitationEmail from './components/InvitationEmail.jsx';

export const emailTemplates = {
  welcome: WelcomeEmail,
  passwordReset: PasswordResetEmail,
  verification: VerificationEmail,
  invitation: InvitationEmail
};

export type EmailTemplateType = keyof typeof emailTemplates;
