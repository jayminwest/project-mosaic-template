#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { prompt } from 'inquirer';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import chalk from 'chalk';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

async function main() {
  console.log(chalk.blue('🔧 Project Mosaic Configuration Setup'));
  console.log(chalk.gray('This script will help you configure your micro-SaaS product'));

  // Product configuration
  const productAnswers = await prompt([
    {
      type: 'input',
      name: 'name',
      message: 'What is your product name?',
      default: 'My SaaS Product',
    },
    {
      type: 'input',
      name: 'description',
      message: 'Enter a brief description:',
      default: 'A powerful micro-SaaS solution',
    },
    {
      type: 'input',
      name: 'slug',
      message: 'Enter a URL-friendly slug:',
      default: 'my-saas-product',
    },
  ]);

  // Feature configuration
  const featureAnswers = await prompt([
    {
      type: 'confirm',
      name: 'enableAI',
      message: 'Enable AI features?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'enableStorage',
      message: 'Enable storage features?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'enableSharing',
      message: 'Enable sharing features?',
      default: false,
    },
  ]);

  // Resource limits configuration
  const limitsAnswers = await prompt([
    {
      type: 'number',
      name: 'freeResourceLimit',
      message: 'Free tier resource limit:',
      default: 10,
    },
    {
      type: 'number',
      name: 'freeStorageLimit',
      message: 'Free tier storage limit (MB):',
      default: 5,
    },
    {
      type: 'number',
      name: 'premiumResourceLimit',
      message: 'Premium tier resource limit:',
      default: 100,
    },
    {
      type: 'number',
      name: 'premiumStorageLimit',
      message: 'Premium tier storage limit (MB):',
      default: 50,
    },
  ]);

  // Subscription plan configuration
  const planAnswers = await prompt([
    {
      type: 'input',
      name: 'premiumPlanName',
      message: 'Premium plan name:',
      default: 'Premium',
    },
    {
      type: 'input',
      name: 'premiumPlanDescription',
      message: 'Premium plan description:',
      default: 'Advanced features for professionals',
    },
    {
      type: 'number',
      name: 'premiumPlanPrice',
      message: 'Premium plan price (USD):',
      default: 9.99,
    },
    {
      type: 'list',
      name: 'premiumPlanInterval',
      message: 'Premium plan billing interval:',
      choices: ['month', 'year'],
      default: 'month',
    },
  ]);

  // Create Stripe products and prices
  console.log(chalk.blue('\n🔄 Creating Stripe products and prices...'));
  
  try {
    // Check if Stripe API key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured in .env.local');
    }

    // Create or update the premium product
    const createStripe = await prompt([
      {
        type: 'confirm',
        name: 'createStripeProduct',
        message: 'Create Stripe product and price for the premium plan?',
        default: true,
      },
    ]);

    let premiumPriceId = '';
    
    if (createStripe.createStripeProduct) {
      // Create or update the premium product
      const product = await stripe.products.create({
        name: `${productAnswers.name} ${planAnswers.premiumPlanName}`,
        description: planAnswers.premiumPlanDescription,
        metadata: {
          plan_type: 'premium',
        },
      });
      
      console.log(chalk.green(`✅ Created Stripe product: ${product.id}`));
      
      // Create price for the premium product
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(planAnswers.premiumPlanPrice * 100), // Convert to cents
        currency: 'usd',
        recurring: {
          interval: planAnswers.premiumPlanInterval,
        },
        metadata: {
          plan_type: 'premium',
        },
      });
      
      console.log(chalk.green(`✅ Created Stripe price: ${price.id}`));
      premiumPriceId = price.id;
    }

    // Generate configuration files
    console.log(chalk.blue('\n🔄 Generating configuration files...'));
    
    // Create directories if they don't exist
    const configDir = path.join(process.cwd(), 'lib', 'config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    // Update default-config.ts
    const defaultConfigPath = path.join(configDir, 'default-config.ts');
    const defaultConfigTemplate = `
import { ProductConfig } from './types';

export const productConfig: ProductConfig = {
  name: "${productAnswers.name}",
  description: "${productAnswers.description}",
  slug: "${productAnswers.slug}",
  limits: {
    free: {
      resourceLimit: ${limitsAnswers.freeResourceLimit},
      storageLimit: ${limitsAnswers.freeStorageLimit},
    },
    premium: {
      resourceLimit: ${limitsAnswers.premiumResourceLimit},
      storageLimit: ${limitsAnswers.premiumStorageLimit},
    }
  },
  features: {
    enableAI: ${featureAnswers.enableAI},
    enableStorage: ${featureAnswers.enableStorage},
    enableSharing: ${featureAnswers.enableSharing},
  }
};
`;
    
    // Update subscription.ts
    const subscriptionPath = path.join(configDir, 'subscription.ts');
    const subscriptionTemplate = `
import { SubscriptionPlan } from './types';

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Basic features for personal use",
    priceId: "",
    price: 0,
    currency: "USD",
    interval: "month",
    planType: "free",
    features: [
      "Up to ${limitsAnswers.freeResourceLimit} resources",
      "${limitsAnswers.freeStorageLimit}MB storage",
      "Basic features"
    ]
  },
  {
    id: "premium",
    name: "${planAnswers.premiumPlanName}",
    description: "${planAnswers.premiumPlanDescription}",
    priceId: "${premiumPriceId}",
    price: ${planAnswers.premiumPlanPrice},
    currency: "USD",
    interval: "${planAnswers.premiumPlanInterval}",
    planType: "premium",
    features: [
      "Up to ${limitsAnswers.premiumResourceLimit} resources",
      "${limitsAnswers.premiumStorageLimit}MB storage",
      "Advanced features",
      "Priority support"
    ]
  }
];
`;
    
    // Write the files
    fs.writeFileSync(defaultConfigPath, defaultConfigTemplate.trim());
    fs.writeFileSync(subscriptionPath, subscriptionTemplate.trim());
    
    console.log(chalk.green('✅ Configuration files generated successfully!'));
    console.log(chalk.blue('\n🎉 Setup complete! Your micro-SaaS product is configured and ready to go.'));
    
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
