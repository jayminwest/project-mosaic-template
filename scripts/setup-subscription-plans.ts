#!/usr/bin/env ts-node
import chalk from 'chalk';
import { config } from 'dotenv';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import inquirer from 'inquirer';
import path from 'path';
import Stripe from 'stripe';

// Load environment variables
config({ path: '.env.local' });

// Check if Stripe API key is available
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

interface PlanFeature {
  description: string;
}

interface ResourceLimit {
  name: string;
  value: number;
}

interface SubscriptionPlan {
  name: string;
  description: string;
  planType: 'free' | 'premium' | 'enterprise';
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: PlanFeature[];
  limits: ResourceLimit[];
}

async function setupSubscriptionPlans() {
  console.log(chalk.blue('Project Mosaic - Subscription Plan Setup'));
  console.log(chalk.gray('This tool will help you configure subscription plans in Stripe'));
  
  // Check if Stripe API key is configured
  if (!STRIPE_SECRET_KEY) {
    console.log(chalk.red('Stripe API key is not configured'));
    console.log(chalk.gray('Please add STRIPE_SECRET_KEY to your .env.local file'));
    
    const { setupKey } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'setupKey',
        message: 'Would you like to add a Stripe API key now?',
        default: true,
      }
    ]);
    
    if (setupKey) {
      const { apiKey } = await inquirer.prompt([
        {
          type: 'input',
          name: 'apiKey',
          message: 'Enter your Stripe Secret Key (starts with sk_):',
          validate: (input) => input.startsWith('sk_') ? true : 'Invalid Stripe key format'
        }
      ]);
      
      // Update .env.local file
      const envPath = path.join(process.cwd(), '.env.local');
      let envContent = '';
      
      if (existsSync(envPath)) {
        envContent = readFileSync(envPath, 'utf8');
        
        // Replace existing key or add new one
        if (envContent.includes('STRIPE_SECRET_KEY=')) {
          envContent = envContent.replace(/STRIPE_SECRET_KEY=.*/g, `STRIPE_SECRET_KEY=${apiKey}`);
        } else {
          envContent += `\nSTRIPE_SECRET_KEY=${apiKey}`;
        }
      } else {
        envContent = `STRIPE_SECRET_KEY=${apiKey}`;
      }
      
      writeFileSync(envPath, envContent);
      console.log(chalk.green('Stripe API key added to .env.local'));
      
      // Update the variable for current session
      process.env.STRIPE_SECRET_KEY = apiKey;
    } else {
      console.log(chalk.yellow('Exiting setup. Please configure Stripe API key and run again.'));
      return;
    }
  }
  
  // Initialize Stripe client
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
  });
  
  console.log(chalk.green('✓ Stripe API key is configured'));
  
  // Check if plans already exist
  console.log(chalk.gray('Checking for existing subscription plans...'));
  
  const existingProducts = await stripe.products.list({
    active: true,
    expand: ['data.default_price'],
  });
  
  const existingPlans = existingProducts.data
    .filter(product => product.metadata && product.metadata.plan_type)
    .map(product => {
      const price = typeof product.default_price === 'object' ? product.default_price : null;
      
      return {
        id: product.id,
        name: product.name,
        description: product.description || '',
        planType: product.metadata.plan_type as 'free' | 'premium' | 'enterprise',
        price: price?.unit_amount ? price.unit_amount / 100 : 0,
        currency: price?.currency || 'usd',
        interval: price?.type === 'recurring' && price.recurring 
          ? price.recurring.interval as 'month' | 'year' 
          : 'month',
      };
    });
  
  if (existingPlans.length > 0) {
    console.log(chalk.green(`Found ${existingPlans.length} existing subscription plans:`));
    existingPlans.forEach(plan => {
      console.log(chalk.blue(`- ${plan.name} (${plan.planType}): ${plan.price} ${plan.currency}/${plan.interval}`));
    });
    
    const { modifyPlans } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'modifyPlans',
        message: 'Would you like to modify existing plans or create new ones?',
        default: false,
      }
    ]);
    
    if (!modifyPlans) {
      console.log(chalk.yellow('Using existing plans. No changes made.'));
      return;
    }
  }
  
  // Configure plans
  const plans: SubscriptionPlan[] = [];
  
  // Always create a free plan
  console.log(chalk.blue('\nLet\'s configure the Free plan:'));
  
  const freePlan: SubscriptionPlan = {
    name: 'Free',
    description: 'Basic features for personal use',
    planType: 'free',
    price: 0,
    currency: 'usd',
    interval: 'month',
    features: [],
    limits: [],
  };
  
  // Configure free plan features
  const { freeFeatureCount } = await inquirer.prompt([
    {
      type: 'number',
      name: 'freeFeatureCount',
      message: 'How many features does the Free plan include?',
      default: 3,
    }
  ]);
  
  for (let i = 0; i < freeFeatureCount; i++) {
    const { featureDescription } = await inquirer.prompt([
      {
        type: 'input',
        name: 'featureDescription',
        message: `Enter feature #${i + 1} for Free plan:`,
        default: i === 0 ? 'Basic functionality' : '',
      }
    ]);
    
    freePlan.features.push({ description: featureDescription });
  }
  
  // Configure free plan limits
  const { freeLimitCount } = await inquirer.prompt([
    {
      type: 'number',
      name: 'freeLimitCount',
      message: 'How many resource limits does the Free plan have?',
      default: 2,
    }
  ]);
  
  for (let i = 0; i < freeLimitCount; i++) {
    const { limitName, limitValue } = await inquirer.prompt([
      {
        type: 'input',
        name: 'limitName',
        message: `Enter resource limit name #${i + 1} for Free plan:`,
        default: i === 0 ? 'storage' : i === 1 ? 'resources' : '',
      },
      {
        type: 'number',
        name: 'limitValue',
        message: (answers) => `Enter limit value for ${answers.limitName}:`,
        default: i === 0 ? 10 : 5,
      }
    ]);
    
    freePlan.limits.push({ name: limitName, value: limitValue });
  }
  
  plans.push(freePlan);
  
  // Configure premium plan
  console.log(chalk.blue('\nLet\'s configure the Premium plan:'));
  
  const { premiumPlanName, premiumPlanDescription, premiumPlanPrice, premiumPlanCurrency, premiumPlanInterval } = await inquirer.prompt([
    {
      type: 'input',
      name: 'premiumPlanName',
      message: 'Enter name for the Premium plan:',
      default: 'Premium',
    },
    {
      type: 'input',
      name: 'premiumPlanDescription',
      message: 'Enter description for the Premium plan:',
      default: 'Advanced features for professionals',
    },
    {
      type: 'number',
      name: 'premiumPlanPrice',
      message: 'Enter monthly price for the Premium plan (in USD):',
      default: 9.99,
    },
    {
      type: 'list',
      name: 'premiumPlanCurrency',
      message: 'Select currency:',
      choices: ['usd', 'eur', 'gbp', 'cad', 'aud'],
      default: 'usd',
    },
    {
      type: 'list',
      name: 'premiumPlanInterval',
      message: 'Select billing interval:',
      choices: ['month', 'year'],
      default: 'month',
    }
  ]);
  
  const premiumPlan: SubscriptionPlan = {
    name: premiumPlanName,
    description: premiumPlanDescription,
    planType: 'premium',
    price: premiumPlanPrice,
    currency: premiumPlanCurrency,
    interval: premiumPlanInterval as 'month' | 'year',
    features: [],
    limits: [],
  };
  
  // Configure premium plan features
  const { premiumFeatureCount } = await inquirer.prompt([
    {
      type: 'number',
      name: 'premiumFeatureCount',
      message: 'How many features does the Premium plan include?',
      default: 5,
    }
  ]);
  
  for (let i = 0; i < premiumFeatureCount; i++) {
    const { featureDescription } = await inquirer.prompt([
      {
        type: 'input',
        name: 'featureDescription',
        message: `Enter feature #${i + 1} for Premium plan:`,
        default: i === 0 ? 'Advanced functionality' : '',
      }
    ]);
    
    premiumPlan.features.push({ description: featureDescription });
  }
  
  // Configure premium plan limits
  const { premiumLimitCount } = await inquirer.prompt([
    {
      type: 'number',
      name: 'premiumLimitCount',
      message: 'How many resource limits does the Premium plan have?',
      default: 2,
    }
  ]);
  
  for (let i = 0; i < premiumLimitCount; i++) {
    const { limitName, limitValue } = await inquirer.prompt([
      {
        type: 'input',
        name: 'limitName',
        message: `Enter resource limit name #${i + 1} for Premium plan:`,
        default: i === 0 ? 'storage' : i === 1 ? 'resources' : '',
      },
      {
        type: 'number',
        name: 'limitValue',
        message: (answers) => `Enter limit value for ${answers.limitName}:`,
        default: i === 0 ? 50 : 100,
      }
    ]);
    
    premiumPlan.limits.push({ name: limitName, value: limitValue });
  }
  
  plans.push(premiumPlan);
  
  // Ask if user wants to create an Enterprise plan
  const { createEnterprisePlan } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'createEnterprisePlan',
      message: 'Would you like to create an Enterprise plan?',
      default: false,
    }
  ]);
  
  if (createEnterprisePlan) {
    console.log(chalk.blue('\nLet\'s configure the Enterprise plan:'));
    
    const { enterprisePlanName, enterprisePlanDescription, enterprisePlanPrice, enterprisePlanCurrency, enterprisePlanInterval } = await inquirer.prompt([
      {
        type: 'input',
        name: 'enterprisePlanName',
        message: 'Enter name for the Enterprise plan:',
        default: 'Enterprise',
      },
      {
        type: 'input',
        name: 'enterprisePlanDescription',
        message: 'Enter description for the Enterprise plan:',
        default: 'Full-featured solution for teams',
      },
      {
        type: 'number',
        name: 'enterprisePlanPrice',
        message: 'Enter monthly price for the Enterprise plan (in USD):',
        default: 29.99,
      },
      {
        type: 'list',
        name: 'enterprisePlanCurrency',
        message: 'Select currency:',
        choices: ['usd', 'eur', 'gbp', 'cad', 'aud'],
        default: 'usd',
      },
      {
        type: 'list',
        name: 'enterprisePlanInterval',
        message: 'Select billing interval:',
        choices: ['month', 'year'],
        default: 'month',
      }
    ]);
    
    const enterprisePlan: SubscriptionPlan = {
      name: enterprisePlanName,
      description: enterprisePlanDescription,
      planType: 'enterprise',
      price: enterprisePlanPrice,
      currency: enterprisePlanCurrency,
      interval: enterprisePlanInterval as 'month' | 'year',
      features: [],
      limits: [],
    };
    
    // Configure enterprise plan features
    const { enterpriseFeatureCount } = await inquirer.prompt([
      {
        type: 'number',
        name: 'enterpriseFeatureCount',
        message: 'How many features does the Enterprise plan include?',
        default: 7,
      }
    ]);
    
    for (let i = 0; i < enterpriseFeatureCount; i++) {
      const { featureDescription } = await inquirer.prompt([
        {
          type: 'input',
          name: 'featureDescription',
          message: `Enter feature #${i + 1} for Enterprise plan:`,
          default: i === 0 ? 'Premium functionality' : '',
        }
      ]);
      
      enterprisePlan.features.push({ description: featureDescription });
    }
    
    // Configure enterprise plan limits
    const { enterpriseLimitCount } = await inquirer.prompt([
      {
        type: 'number',
        name: 'enterpriseLimitCount',
        message: 'How many resource limits does the Enterprise plan have?',
        default: 2,
      }
    ]);
    
    for (let i = 0; i < enterpriseLimitCount; i++) {
      const { limitName, limitValue } = await inquirer.prompt([
        {
          type: 'input',
          name: 'limitName',
          message: `Enter resource limit name #${i + 1} for Enterprise plan:`,
          default: i === 0 ? 'storage' : i === 1 ? 'resources' : '',
        },
        {
          type: 'number',
          name: 'limitValue',
          message: (answers) => `Enter limit value for ${answers.limitName}:`,
          default: i === 0 ? 500 : 1000,
        }
      ]);
      
      enterprisePlan.limits.push({ name: limitName, value: limitValue });
    }
    
    plans.push(enterprisePlan);
  }
  
  // Review plans before creating
  console.log(chalk.blue('\nReview your subscription plans:'));
  
  plans.forEach(plan => {
    console.log(chalk.green(`\n${plan.name} (${plan.planType})`));
    console.log(chalk.gray(`Description: ${plan.description}`));
    console.log(chalk.gray(`Price: ${plan.price} ${plan.currency}/${plan.interval}`));
    
    console.log(chalk.gray('Features:'));
    plan.features.forEach((feature, index) => {
      console.log(chalk.gray(`  ${index + 1}. ${feature.description}`));
    });
    
    console.log(chalk.gray('Limits:'));
    plan.limits.forEach(limit => {
      console.log(chalk.gray(`  - ${limit.name}: ${limit.value}`));
    });
  });
  
  const { confirmPlans } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmPlans',
      message: 'Do you want to create these plans in Stripe?',
      default: true,
    }
  ]);
  
  if (!confirmPlans) {
    console.log(chalk.yellow('Plan creation canceled.'));
    return;
  }
  
  // Create plans in Stripe
  console.log(chalk.blue('\nCreating subscription plans in Stripe...'));
  
  for (const plan of plans) {
    try {
      // Create product with all metadata at once to avoid race conditions
      const productMetadata = {
        plan_type: plan.planType,
        features: plan.features.map(f => f.description).join(', '),
        ...plan.limits.reduce((acc, limit) => ({
          ...acc,
          [`limit_${limit.name}`]: limit.value.toString(),
        }), {})
      };
      
      // Add individual features to metadata
      for (let i = 0; i < plan.features.length; i++) {
        productMetadata[`feature_${i + 1}`] = plan.features[i].description;
      }
      
      // Create the product with all metadata
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: productMetadata,
      });
      
      console.log(chalk.green(`✓ Created product: ${product.name}`));
      console.log(chalk.gray(`  with metadata: ${JSON.stringify(productMetadata)}`));
      
      console.log(chalk.green(`✓ Added ${plan.features.length} features to metadata`));
      
      // Create price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(plan.price * 100), // Convert to cents
        currency: plan.currency,
        recurring: {
          interval: plan.interval,
        },
      });
      
      console.log(chalk.green(`✓ Created price: ${price.unit_amount! / 100} ${price.currency}/${plan.interval}`));
      
      // Set as default price
      await stripe.products.update(product.id, {
        default_price: price.id,
      });
      
      console.log(chalk.green(`✓ Set default price for ${product.name}`));
    } catch (error: any) {
      console.error(chalk.red(`Error creating plan ${plan.name}:`), error.message);
    }
  }
  
  console.log(chalk.green('\nSubscription plans created successfully!'));
  console.log(chalk.blue('You can now test your subscription plans with:'));
  console.log(chalk.gray('npm run test-subscription-plans'));
}

// Run the setup
setupSubscriptionPlans().catch(error => {
  console.error(chalk.red('Error during subscription plan setup:'), error);
  process.exit(1);
});
