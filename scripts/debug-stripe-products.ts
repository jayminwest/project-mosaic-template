#!/usr/bin/env ts-node
import chalk from 'chalk';
import { config } from 'dotenv';
import Stripe from 'stripe';

// Load environment variables
config({ path: '.env.local' });

// Check if Stripe API key is available
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

async function debugStripeProducts() {
  console.log(chalk.blue('Project Mosaic - Debug Stripe Products'));
  
  if (!STRIPE_SECRET_KEY) {
    console.log(chalk.red('Stripe API key is not configured'));
    console.log(chalk.gray('Please add STRIPE_SECRET_KEY to your .env.local file'));
    return;
  }
  
  // Initialize Stripe client
  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });
  
  console.log(chalk.green('✓ Stripe API key is configured'));
  console.log(chalk.gray('Fetching products from Stripe...'));
  
  try {
    // Get all products
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
    });
    
    console.log(chalk.green(`Found ${products.data.length} products in Stripe`));
    
    // Check each product for proper metadata
    let hasValidPlans = false;
    
    for (const product of products.data) {
      console.log(chalk.blue(`\nProduct: ${product.name} (ID: ${product.id})`));
      console.log(chalk.gray(`Description: ${product.description || 'No description'}`));
      
      // Check if product has a default price
      const price = typeof product.default_price === 'object' ? product.default_price : null;
      if (price) {
        console.log(chalk.gray(`Default Price: ${price.unit_amount! / 100} ${price.currency}/${
          price.type === 'recurring' && price.recurring ? price.recurring.interval : 'one-time'
        }`));
        console.log(chalk.gray(`Price ID: ${price.id}`));
      } else {
        console.log(chalk.red('❌ No default price set for this product'));
      }
      
      // Check metadata
      if (product.metadata && Object.keys(product.metadata).length > 0) {
        console.log(chalk.gray('Metadata:'));
        for (const [key, value] of Object.entries(product.metadata)) {
          console.log(chalk.gray(`  ${key}: ${value}`));
        }
        
        // Check for plan_type
        if (product.metadata.plan_type) {
          if (['free', 'premium', 'enterprise'].includes(product.metadata.plan_type)) {
            console.log(chalk.green(`✓ Valid plan_type: ${product.metadata.plan_type}`));
            hasValidPlans = true;
          } else {
            console.log(chalk.red(`❌ Invalid plan_type: ${product.metadata.plan_type}`));
            console.log(chalk.gray('  plan_type must be one of: free, premium, enterprise'));
          }
        } else {
          console.log(chalk.red('❌ Missing plan_type metadata'));
          console.log(chalk.gray('  Add plan_type: free, premium, or enterprise'));
        }
        
        // Check for features
        if (product.metadata.features) {
          console.log(chalk.green('✓ Features defined in metadata'));
        } else {
          // Check for individual feature_X keys
          const featureKeys = Object.keys(product.metadata).filter(key => key.startsWith('feature_'));
          if (featureKeys.length > 0) {
            console.log(chalk.green(`✓ ${featureKeys.length} features defined as individual keys`));
          } else {
            console.log(chalk.red('❌ No features defined in metadata'));
            console.log(chalk.gray('  Add features as comma-separated list or as feature_1, feature_2, etc.'));
          }
        }
      } else {
        console.log(chalk.red('❌ No metadata defined for this product'));
        console.log(chalk.gray('  Add at least plan_type and features metadata'));
      }
    }
    
    if (!hasValidPlans) {
      console.log(chalk.yellow('\nNo valid subscription plans found.'));
      console.log(chalk.gray('Please run the setup-subscription-plans script to create plans with proper metadata.'));
    }
    
    // Provide fix instructions
    console.log(chalk.blue('\nTo fix issues with your Stripe products:'));
    console.log(chalk.gray('1. Run the setup script: npm run setup-subscription-plans'));
    console.log(chalk.gray('2. Or manually update products in the Stripe dashboard:'));
    console.log(chalk.gray('   - Add plan_type: free, premium, or enterprise'));
    console.log(chalk.gray('   - Add features as comma-separated list or as feature_1, feature_2, etc.'));
    console.log(chalk.gray('   - Ensure each product has a default price'));
    
  } catch (error: any) {
    console.error(chalk.red('Error fetching Stripe products:'), error.message);
  }
}

// Run the debug function
debugStripeProducts().catch(error => {
  console.error(chalk.red('Error:'), error);
  process.exit(1);
});
