import { Resend } from 'resend';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import dotenv from 'dotenv';

// Load environment variables from .env.local if it exists
if (fs.existsSync(path.join(process.cwd(), '.env.local'))) {
  dotenv.config({ path: path.join(process.cwd(), '.env.local') });
}

async function setupEmail() {
  console.log(chalk.blue('Project Mosaic - Email Setup'));
  console.log(chalk.gray('This tool will help you configure email for your micro-SaaS project'));
  
  // Check if RESEND_API_KEY is already in .env.local
  const envLocalPath = path.join(process.cwd(), '.env.local');
  let apiKey = process.env.RESEND_API_KEY || '';
  
  if (apiKey) {
    console.log(chalk.blue('Found existing Resend API key in .env.local'));
    
    // Ask if user wants to use the existing key or enter a new one
    const { useExisting } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'useExisting',
        message: 'Use existing API key?',
        default: true
      }
    ]);
    
    if (!useExisting) {
      apiKey = '';
    }
  }
  
  // If no API key found or user wants to enter a new one, prompt for it
  if (!apiKey) {
    const response = await inquirer.prompt([
      {
        type: 'password',
        name: 'apiKey',
        message: 'Resend API Key:',
        validate: (input) => input.length > 0 || 'API Key is required'
      }
    ]);
    apiKey = response.apiKey;
  }
  
  // Test the API key
  try {
    console.log(chalk.gray('Validating API key...'));
    const resend = new Resend(apiKey);
    
    // Simple test email to verify the API key works
    const testResult = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'delivered@resend.dev',
      subject: 'API Key Test',
      text: 'This is a test to verify the API key works.',
    });
    
    if (testResult.error) {
      console.log(chalk.red('Error: Invalid API key or API request failed'));
      console.log(chalk.gray(testResult.error.message));
      return;
    }
    
    console.log(chalk.green('✓ API key is valid'));
    
    // Get domain information
    const { setupDomain, domain, fromEmail } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'setupDomain',
        message: 'Would you like to set up a custom domain?',
        default: true
      },
      {
        type: 'input',
        name: 'domain',
        message: 'Domain name (e.g., yourdomain.com):',
        when: (answers) => answers.setupDomain,
        validate: (input) => input.length > 0 || 'Domain is required'
      },
      {
        type: 'input',
        name: 'fromEmail',
        message: 'From email address:',
        default: (answers) => answers.setupDomain ? `noreply@${answers.domain}` : 'noreply@resend.dev',
        validate: (input) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) || 'Please enter a valid email'
      }
    ]);
    
    // Set up domain if requested
    if (setupDomain && domain) {
      console.log(chalk.gray(`Setting up domain: ${domain}`));
      
      const { data: domainData, error: domainError } = await resend.domains.create({
        name: domain
      });
      
      if (domainError) {
        console.log(chalk.yellow(`Warning: Could not set up domain automatically: ${domainError.message}`));
        console.log(chalk.gray('You can set up the domain manually in the Resend dashboard'));
      } else {
        console.log(chalk.green('✓ Domain created successfully'));
        console.log(chalk.blue('DNS Records to add:'));
        
        // Display DNS records (this is a simplified example)
        console.log(chalk.gray('Please add the following DNS records to your domain:'));
        console.log(chalk.gray('1. TXT record: _resend with value provided in the Resend dashboard'));
        console.log(chalk.gray('2. MX record: mx.resend.com with priority 10'));
        console.log(chalk.gray('3. DKIM record: as provided in the Resend dashboard'));
        
        console.log(chalk.yellow('\nImportant: It may take up to 24 hours for DNS changes to propagate'));
        console.log(chalk.yellow('Check the Resend dashboard for verification status'));
      }
    }
    
    // Update .env.local file
    console.log(chalk.gray('\nUpdating environment variables in .env.local...'));
    
    let envContent = '';
    if (fs.existsSync(envLocalPath)) {
      envContent = fs.readFileSync(envLocalPath, 'utf8');
    }
    
    // Update or add email variables
    const envVars = {
      RESEND_API_KEY: apiKey,
      EMAIL_FROM: fromEmail
    };
    
    Object.entries(envVars).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*`, 'm');
      if (envContent.match(regex)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    });
    
    fs.writeFileSync(envLocalPath, envContent);
    console.log(chalk.green(`Environment variables updated in .env.local`));
    
    // Supabase SMTP configuration guidance
    console.log(chalk.blue('\nConfiguring Supabase to use Resend for authentication emails:'));
    
    const { configureSupabaseEmails } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'configureSupabaseEmails',
        message: 'Would you like to configure Supabase to use Resend for auth emails?',
        default: true
      }
    ]);
    
    if (configureSupabaseEmails) {
      // Get Resend SMTP credentials
      console.log(chalk.gray('\nTo complete the setup, you need Resend SMTP credentials.'));
      
      console.log(chalk.yellow('\nTo get your Resend SMTP credentials:'));
      console.log(chalk.gray('1. Go to the Resend dashboard: https://resend.com/dashboard'));
      console.log(chalk.gray('2. Navigate to the SMTP section'));
      console.log(chalk.gray('3. Generate or view your SMTP credentials'));
      
      const { smtpUsername, smtpPassword } = await inquirer.prompt([
        {
          type: 'input',
          name: 'smtpUsername',
          message: 'Resend SMTP Username:',
          validate: (input) => input.length > 0 || 'SMTP Username is required'
        },
        {
          type: 'password',
          name: 'smtpPassword',
          message: 'Resend SMTP Password:',
          validate: (input) => input.length > 0 || 'SMTP Password is required'
        }
      ]);
      
      console.log(chalk.blue('\nTo configure Supabase with these credentials:'));
      console.log(chalk.gray('1. Go to your Supabase dashboard: https://app.supabase.io'));
      console.log(chalk.gray('2. Navigate to Project Settings > Auth > SMTP'));
      console.log(chalk.gray('3. Enable Custom SMTP'));
      console.log(chalk.gray('4. Enter the following details:'));
      console.log(chalk.gray('   - Host: smtp.resend.com'));
      console.log(chalk.gray('   - Port: 465'));
      console.log(chalk.gray(`   - Username: ${smtpUsername}`));
      console.log(chalk.gray('   - Password: [Your SMTP Password]'));
      console.log(chalk.gray('   - Sender Name: Your product name'));
      console.log(chalk.gray(`   - Sender Email: ${fromEmail}`));
      console.log(chalk.gray('5. Save your changes'));
      
      console.log(chalk.blue('\nTo customize Supabase email templates:'));
      console.log(chalk.gray('1. In the Supabase dashboard, go to Authentication > Email Templates'));
      console.log(chalk.gray('2. Customize the templates for:'));
      console.log(chalk.gray('   - Confirmation emails'));
      console.log(chalk.gray('   - Invitation emails'));
      console.log(chalk.gray('   - Magic link emails'));
      console.log(chalk.gray('   - Reset password emails'));
      
      // Save SMTP credentials to .env.local for reference
      const smtpEnvVars = {
        RESEND_SMTP_HOST: 'smtp.resend.com',
        RESEND_SMTP_PORT: '465',
        RESEND_SMTP_USERNAME: smtpUsername,
        // We don't save the password to the env file for security reasons
      };
      
      Object.entries(smtpEnvVars).forEach(([key, value]) => {
        const regex = new RegExp(`^${key}=.*`, 'm');
        if (envContent.match(regex)) {
          envContent = envContent.replace(regex, `${key}=${value}`);
        } else {
          envContent += `\n${key}=${value}`;
        }
      });
      
      fs.writeFileSync(envLocalPath, envContent);
      console.log(chalk.green(`SMTP configuration saved to .env.local`));
    }
    
    console.log(chalk.green('\nEmail setup complete!'));
    console.log(chalk.blue('Next steps:'));
    console.log(chalk.gray('1. Restart your development server'));
    console.log(chalk.gray('2. Test email functionality with the test command:'));
    console.log(chalk.gray('   npm run test-email'));
    console.log(chalk.gray('3. If you configured Supabase SMTP, complete the setup in your Supabase dashboard'));
    console.log(chalk.gray('4. For custom transactional emails (not auth-related), use the email service:'));
    console.log(chalk.gray('   import { emailService } from \'../lib/email/email-service\';'));
    console.log(chalk.gray('   await emailService.sendEmail({...});'));
    
  } catch (error: any) {
    console.log(chalk.red('Error setting up email:'));
    console.log(chalk.gray(error?.message || 'Unknown error occurred'));
  }
}

setupEmail().catch(console.error);
