import { 
  WelcomeEmail, 
  PasswordResetEmail, 
  VerificationEmail,
  InvitationEmail
} from './components';

export const emailTemplates = {
  welcome: WelcomeEmail,
  passwordReset: PasswordResetEmail,
  verification: VerificationEmail,
  invitation: InvitationEmail
};

export type EmailTemplateType = keyof typeof emailTemplates;
