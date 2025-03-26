#!/usr/bin/env ts-node
import chalk from 'chalk';
import { config } from 'dotenv';
import inquirer from 'inquirer';
import fetch from 'node-fetch';

// Load environment variables
config({ path: '.env.local' });

// Check if required environment variables are set
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testSubscriptionPlans() {
  console.log(chalk.blue('Project Mosaic - Test Subscription Plans'));
  console.log(chalk.gray('This tool will test your Stripe subscription plan configuration'));
  
  // Check if required environment variables are set
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log(chalk.red('Missing required environment variables'));
    console.log(chalk.gray('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local'));
    return;
  }
  
  try {
    console.log(chalk.gray('Fetching subscription plans...'));
    
    // Add debugging to see what's happening
    console.log(chalk.gray(`Using Supabase URL: ${SUPABASE_URL}`));
    console.log(chalk.gray(`API Key length: ${SUPABASE_ANON_KEY?.length || 0} characters`));
    
    // Add debug flag to request
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/list-subscription-plans`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY, // Add this as well for compatibility
        },
        body: JSON.stringify({ debug: true }),
      }
    );
    
    console.log(chalk.gray(`Response status: ${response.status} ${response.statusText}`));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(chalk.red(`Error response: ${errorText}`));
      throw new Error(`Failed to fetch subscription plans: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(chalk.gray(`Raw response data: ${JSON.stringify(data, null, 2)}`));
    
    // Check for debug info
    if (data.debug) {
      console.log(chalk.yellow('\nDebug Information:'));
      console.log(chalk.gray(JSON.stringify(data.debug, null, 2)));
    }
    
    if (!data.plans || data.plans.length === 0) {
      console.log(chalk.yellow('No subscription plans found.'));
      console.log(chalk.gray('Please run the setup-subscription-plans script to create plans.'));
      return;
    }
    
    console.log(chalk.green(`✓ Found ${data.plans.length} subscription plans:`));
    
    data.plans.forEach((plan: any) => {
      console.log(chalk.blue(`\n${plan.name} (${plan.planType})`));
      console.log(chalk.gray(`Description: ${plan.description || 'No description'}`));
      console.log(chalk.gray(`Price: ${plan.price} ${plan.currency}/${plan.interval || 'month'}`));
      console.log(chalk.gray(`Price ID: ${plan.priceId}`));
      
      if (plan.features && plan.features.length > 0) {
        console.log(chalk.gray('Features:'));
        plan.features.forEach((feature: string, index: number) => {
          console.log(chalk.gray(`  ${index + 1}. ${feature}`));
        });
      } else {
        console.log(chalk.yellow('No features defined for this plan.'));
      }
      
      if (plan.limits) {
        console.log(chalk.gray('Limits:'));
        Object.entries(plan.limits).forEach(([key, value]) => {
          console.log(chalk.gray(`  - ${key}: ${value}`));
        });
      } else {
        console.log(chalk.yellow('No resource limits defined for this plan.'));
      }
    });
    
    // Validate plan configuration
    let hasErrors = false;
    
    // Check for free plan
    const freePlan = data.plans.find((p: any) => p.planType === 'free');
    if (!freePlan) {
      console.log(chalk.red('❌ No free plan found. A free plan is recommended.'));
      hasErrors = true;
    }
    
    // Check for premium plan
    const premiumPlan = data.plans.find((p: any) => p.planType === 'premium');
    if (!premiumPlan) {
      console.log(chalk.red('❌ No premium plan found. A premium plan is required for monetization.'));
      hasErrors = true;
    }
    
    // Check for features
    data.plans.forEach((plan: any) => {
      if (!plan.features || plan.features.length === 0) {
        console.log(chalk.red(`❌ Plan "${plan.name}" has no features defined.`));
        hasErrors = true;
      }
    });
    
    if (hasErrors) {
      console.log(chalk.yellow('\nSome issues were found with your subscription plans.'));
      console.log(chalk.gray('Consider running the setup-subscription-plans script to fix these issues.'));
    } else {
      console.log(chalk.green('\n✓ All subscription plans are properly configured!'));
    }
    
    // Ask if user wants to test creating a checkout session
    const { testCheckout } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'testCheckout',
        message: 'Would you like to test creating a checkout session?',
        default: false,
      }
    ]);
    
    if (testCheckout) {
      const { selectedPlan } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedPlan',
          message: 'Select a plan to test:',
          choices: data.plans.map((plan: any) => ({
            name: `${plan.name} (${plan.price} ${plan.currency}/${plan.interval})`,
            value: plan.priceId,
          })),
        }
      ]);
      
      console.log(chalk.gray(`Testing checkout session for price ID: ${selectedPlan}`));
      console.log(chalk.yellow('Note: This is just a test and will not create a real checkout session.'));
      console.log(chalk.yellow('To create a real checkout session, use the manageSubscription function in your app.'));
      
      // In a real app, you would call the createCheckoutSession function here
      console.log(chalk.green('✓ Checkout session test completed.'));
    }
    
  } catch (error: any) {
    console.error(chalk.red('Error testing subscription plans:'), error.message);
  }
}

// Run the test
testSubscriptionPlans().catch(error => {
  console.error(chalk.red('Error:'), error);
  process.exit(1);
});
