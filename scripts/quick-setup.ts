#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { 
  quickProductConfig, 
  quickThemeConfig, 
  quickFeatureFlags,
  quickSubscriptionPlans,
  quickStripeConfig,
  quickEmailConfig
} from '../lib/config/quick-setup';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log(chalk.blue('🔧 Project Mosaic Quick Setup'));
  console.log(chalk.gray('Setting up your project based on quick-setup.ts configuration'));
  
  try {
    // Create Stripe products and prices if enabled
    let premiumPriceId = '';
    
    if (quickStripeConfig.createProducts) {
      console.log(chalk.blue('\n🔄 Creating Stripe products and prices...'));
      
      // Check if Stripe API key is configured
      if (!process.env.STRIPE_SECRET_KEY) {
        console.warn(chalk.yellow('⚠️ STRIPE_SECRET_KEY is not configured in .env.local'));
        console.warn(chalk.yellow('⚠️ Skipping Stripe product creation'));
      } else {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: '2023-10-16',
        });
        
        // Create premium product
        const product = await stripe.products.create({
          name: `${quickProductConfig.name} ${quickStripeConfig.premium.productName}`,
          description: quickStripeConfig.premium.productDescription,
          metadata: {
            plan_type: 'premium',
          },
        });
        
        console.log(chalk.green(`✅ Created Stripe product: ${product.id}`));
        
        // Create price for the premium product
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(quickStripeConfig.premium.price * 100), // Convert to cents
          currency: quickStripeConfig.premium.currency,
          recurring: {
            interval: quickStripeConfig.premium.interval,
          },
          metadata: {
            plan_type: 'premium',
          },
        });
        
        console.log(chalk.green(`✅ Created Stripe price: ${price.id}`));
        premiumPriceId = price.id;
        
        // Update the premium plan with the price ID
        quickSubscriptionPlans.find(plan => plan.id === 'premium')!.priceId = premiumPriceId;
      }
    }

    // Generate configuration files
    console.log(chalk.blue('\n🔄 Generating configuration files...'));
    
    // Create directories if they don't exist
    const configDir = path.join(process.cwd(), 'lib', 'config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    // Write default-config.ts
    const defaultConfigPath = path.join(configDir, 'default-config.ts');
    const defaultConfigContent = `
import { ProductConfig } from './types';

export const productConfig: ProductConfig = ${JSON.stringify(quickProductConfig, null, 2)};
`;
    fs.writeFileSync(defaultConfigPath, defaultConfigContent.trim());
    
    // Write theme.ts
    const themePath = path.join(configDir, 'theme.ts');
    const themeContent = `
import { ThemeConfig } from './types';

export const themeConfig: ThemeConfig = ${JSON.stringify(quickThemeConfig, null, 2)};
`;
    fs.writeFileSync(themePath, themeContent.trim());
    
    // Write features.ts
    const featuresPath = path.join(configDir, 'features.ts');
    const featuresContent = `
export const featureFlags = ${JSON.stringify(quickFeatureFlags, null, 2)};
`;
    fs.writeFileSync(featuresPath, featuresContent.trim());
    
    // Write subscription.ts
    const subscriptionPath = path.join(configDir, 'subscription.ts');
    const subscriptionContent = `
import { SubscriptionPlan } from './types';

export const subscriptionPlans: SubscriptionPlan[] = ${JSON.stringify(quickSubscriptionPlans, null, 2)};
`;
    fs.writeFileSync(subscriptionPath, subscriptionContent.trim());
    
    console.log(chalk.green('✅ Configuration files generated successfully!'));
    
    // Email configuration
    if (quickEmailConfig.fromEmail) {
      console.log(chalk.blue('\n🔄 Setting up email configuration...'));
      
      // Update .env.local with email configuration
      const envPath = path.join(process.cwd(), '.env.local');
      let envContent = '';
      
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }
      
      // Add or update EMAIL_FROM
      if (!envContent.includes('EMAIL_FROM=')) {
        envContent += `\nEMAIL_FROM=${quickEmailConfig.fromEmail}\n`;
      } else {
        envContent = envContent.replace(
          /EMAIL_FROM=.*/,
          `EMAIL_FROM=${quickEmailConfig.fromEmail}`
        );
      }
      
      fs.writeFileSync(envPath, envContent);
      
      console.log(chalk.green(`✅ Email configuration updated in .env.local`));
    }
    
    console.log(chalk.blue('\n🎉 Quick setup complete! Your micro-SaaS product is configured and ready to go.'));
    
    // Next steps
    console.log(chalk.yellow('\nNext steps:'));
    console.log('1. Update your database schema for your specific product');
    console.log('2. Create product-specific components and pages');
    console.log('3. Customize the marketing components for your product');
    console.log('4. Deploy your application');
    
  } catch (error) {
    console.error(chalk.red('❌ Error during configuration:'), error);
    process.exit(1);
  }
}

main().catch(console.error);
