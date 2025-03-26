#!/usr/bin/env ts-node
import chalk from 'chalk';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import path from 'path';
import inquirer from 'inquirer';

// Load environment variables
config({ path: path.join(process.cwd(), '.env.local') });

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Helper function to check if a column exists in a table
async function checkColumnExists(table: string, column: string): Promise<boolean> {
  try {
    // Query the information schema to check if the column exists
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', table)
      .eq('column_name', column);
    
    if (error) {
      console.error(`Error checking if column ${column} exists in ${table}:`, error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error(`Error checking column existence:`, error);
    return false;
  }
}

async function resetEnvironment() {
  console.log(chalk.blue('Project Mosaic - Environment Reset Tool'));
  console.log(chalk.yellow('⚠️  WARNING: This will delete data from your development environment'));
  
  // Check if required environment variables are set
  if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.log(chalk.red('Missing required environment variables'));
    console.log(chalk.gray('Please ensure STRIPE_SECRET_KEY, NEXT_PUBLIC_SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY are set'));
    return;
  }
  
  // Confirm before proceeding
  const { confirmReset } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmReset',
      message: 'This will delete all Stripe products and reset your Supabase database. Continue?',
      default: false,
    }
  ]);
  
  if (!confirmReset) {
    console.log(chalk.yellow('Reset cancelled.'));
    return;
  }
  
  try {
    // Initialize clients
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // 1. Reset Stripe products
    console.log(chalk.blue('\n1. Resetting Stripe products...'));
    
    // Get all products
    const products = await stripe.products.list({
      limit: 100,
    });
    
    if (products.data.length === 0) {
      console.log(chalk.gray('No products found in your Stripe account.'));
    } else {
      console.log(chalk.gray(`Found ${products.data.length} products to delete.`));
      
      // Delete each product
      for (const product of products.data) {
        try {
          await stripe.products.update(product.id, { active: false });
          console.log(chalk.gray(`Deactivated product: ${product.name} (${product.id})`));
        } catch (error) {
          console.error(chalk.red(`Error deactivating product ${product.id}:`), error);
        }
      }
      
      console.log(chalk.green('✓ All Stripe products deactivated'));
    }
    
    // 2. Reset Supabase database
    console.log(chalk.blue('\n2. Resetting Supabase database...'));
    
    // Ask which tables to reset
    const { selectedTables } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedTables',
        message: 'Select tables to reset:',
        choices: [
          { name: 'profiles (subscription data)', value: 'profiles', checked: true },
          { name: 'usage_tracking', value: 'usage_tracking', checked: true },
          { name: 'ai_interactions', value: 'ai_interactions', checked: true },
          { name: 'All users (auth.users)', value: 'auth.users', checked: false },
        ],
      }
    ]);
    
    if (selectedTables.length === 0) {
      console.log(chalk.yellow('No tables selected for reset.'));
    } else {
      // Reset selected tables
      for (const table of selectedTables) {
        try {
          if (table === 'auth.users') {
            // Special handling for auth.users
            const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
            
            if (usersError) {
              console.error(chalk.red('Error listing users:'), usersError);
              continue;
            }
            
            console.log(chalk.gray(`Found ${users.users.length} users to delete.`));
            
            for (const user of users.users) {
              const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
              
              if (deleteError) {
                console.error(chalk.red(`Error deleting user ${user.id}:`), deleteError);
              } else {
                console.log(chalk.gray(`Deleted user: ${user.email} (${user.id})`));
              }
            }
            
            console.log(chalk.green('✓ All users deleted'));
          } else {
            // For regular tables, delete all records
            // Different tables have different primary keys, so we use a more generic approach
            let error;
            
            if (table === 'profiles') {
              // For profiles, we update rather than delete to maintain user connections
              const { error: updateError } = await supabase
                .from(table)
                .update({
                  subscription_plan: 'free',
                  updated_at: new Date().toISOString()
                });
              error = updateError;
            } else {
              // For other tables, delete all records
              const { error: deleteError } = await supabase
                .from(table)
                .delete()
                .gte('created_at', '2000-01-01'); // Delete all records
              error = deleteError;
            }
            
            if (error) {
              console.error(chalk.red(`Error resetting table ${table}:`), error);
            } else {
              console.log(chalk.green(`✓ Table ${table} reset`));
            }
          }
        } catch (error) {
          console.error(chalk.red(`Error processing table ${table}:`), error);
        }
      }
    }
    
    // 3. Reset subscription data in profiles
    if (selectedTables.includes('profiles') && !selectedTables.includes('auth.users')) {
      console.log(chalk.blue('\n3. Resetting subscription data in profiles...'));
      
      // Try direct update instead of RPC function
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_plan: 'free',
          // Only include these fields if they exist in the schema
          ...(await checkColumnExists('profiles', 'subscription_status') ? { subscription_status: null } : {}),
          ...(await checkColumnExists('profiles', 'subscription_trial_end') ? { subscription_trial_end: null } : {})
        });
      
      if (updateError) {
        console.error(chalk.red('Error resetting subscription data:'), updateError);
      } else {
        console.log(chalk.green('✓ Subscription data reset'));
      }
    }
    
    console.log(chalk.green('\nEnvironment reset complete!'));
    console.log(chalk.blue('\nNext steps:'));
    console.log(chalk.white('1. Run npm run setup-subscription-plans to create new Stripe products'));
    console.log(chalk.white('2. Restart your application to see the changes'));
    
  } catch (error) {
    console.error(chalk.red('Error resetting environment:'), error);
  }
}

// Run the reset function
resetEnvironment().catch(console.error);
