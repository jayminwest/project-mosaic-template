import { emailService } from '../email/email-service';

export async function sendWelcomeEmail(email: string, name: string, productName: string): Promise<boolean> {
  const result = await emailService.sendEmail({
    to: email,
    subject: `Welcome to ${productName}!`,
    template: 'welcome',
    props: {
      username: name,
      productName,
      actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    }
  });
  
  return result.success;
}

export async function sendPasswordResetEmail(email: string, resetLink: string, productName: string): Promise<boolean> {
  const result = await emailService.sendEmail({
    to: email,
    subject: `Reset your ${productName} password`,
    template: 'passwordReset',
    props: {
      resetLink,
      productName
    }
  });
  
  return result.success;
}

export async function sendVerificationEmail(email: string, verificationLink: string, productName: string): Promise<boolean> {
  const result = await emailService.sendEmail({
    to: email,
    subject: `Verify your ${productName} email`,
    template: 'verification',
    props: {
      verificationLink,
      productName
    }
  });
  
  return result.success;
}

export async function sendInvitationEmail(email: string, inviterName: string, inviteLink: string, productName: string): Promise<boolean> {
  const result = await emailService.sendEmail({
    to: email,
    subject: `${inviterName} has invited you to join ${productName}`,
    template: 'invitation',
    props: {
      inviterName,
      inviteLink,
      productName
    }
  });
  
  return result.success;
}
