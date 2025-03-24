import { emailService } from '../lib/email/email-service';
import inquirer from 'inquirer';
import chalk from 'chalk';

async function testEmail() {
  console.log(chalk.blue('Project Mosaic - Email Test'));
  
  // Verify configuration
  const isConfigured = await emailService.verifyConfiguration();
  if (!isConfigured) {
    console.log(chalk.red('Email service is not configured correctly'));
    console.log(chalk.gray('Please run the setup script: npm run setup-email'));
    return;
  }
  
  // Get test email address
  const { email, template } = await inquirer.prompt([
    {
      type: 'input',
      name: 'email',
      message: 'Send test email to:',
      validate: (input) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) || 'Please enter a valid email'
    },
    {
      type: 'list',
      name: 'template',
      message: 'Select email template to test:',
      choices: [
        { name: 'Welcome Email', value: 'welcome' },
        { name: 'Password Reset', value: 'passwordReset' },
        { name: 'Email Verification', value: 'verification' },
        { name: 'Invitation', value: 'invitation' }
      ]
    }
  ]);
  
  console.log(chalk.gray(`Sending test email to ${email}...`));
  
  try {
    let result;
    
    let result = { success: false, error: 'Unknown error', messageId: '' };
    
    switch (template) {
      case 'welcome':
        result = await emailService.sendEmail({
          to: email,
          subject: 'Welcome to Project Mosaic',
          template: 'welcome',
          props: {
            username: 'Developer',
            productName: 'Project Mosaic',
            actionUrl: 'https://example.com/dashboard'
          }
        });
        break;
        
      case 'passwordReset':
        result = await emailService.sendEmail({
          to: email,
          subject: 'Reset your Project Mosaic password',
          template: 'passwordReset',
          props: {
            resetLink: 'https://example.com/reset-password?token=sample-token',
            productName: 'Project Mosaic'
          }
        });
        break;
        
      case 'verification':
        result = await emailService.sendEmail({
          to: email,
          subject: 'Verify your Project Mosaic email',
          template: 'verification',
          props: {
            verificationLink: 'https://example.com/verify?token=sample-token',
            productName: 'Project Mosaic'
          }
        });
        break;
        
      case 'invitation':
        result = await emailService.sendEmail({
          to: email,
          subject: 'You\'ve been invited to Project Mosaic',
          template: 'invitation',
          props: {
            inviterName: 'The Project Mosaic Team',
            productName: 'Project Mosaic',
            inviteLink: 'https://example.com/invite?token=sample-token'
          }
        });
        break;
    }
    
    if (result.success) {
      console.log(chalk.green('✓ Test email sent successfully!'));
      console.log(chalk.gray(`Message ID: ${result.messageId}`));
    } else {
      console.log(chalk.red('Failed to send test email'));
      console.log(chalk.gray(result.error));
    }
  } catch (error: any) {
    console.log(chalk.red('Error sending test email:'));
    console.log(chalk.gray(error?.message || 'Unknown error occurred'));
  }
}

testEmail().catch(console.error);
