import chalk from 'chalk';
import { getResourceLimit, hasFeatureAccess, getPlanFeatures } from '../lib/config/index';

async function testPlanFeatures() {
  console.log(chalk.blue('Project Mosaic - Test Plan Features'));
  console.log(chalk.gray('This tool will test your plan feature configuration'));
  
  // Test plan features
  console.log('\n' + chalk.yellow('Testing Plan Features:'));
  
  // Attempt to fetch plans from Stripe
  console.log(chalk.gray('Checking for Stripe subscription plans...'));
  
  try {
    // Import the payment service to get real plans from Stripe
    const { createPaymentService } = await import('../lib/payment/payment-service.js');
    const paymentService = createPaymentService();
    
    try {
      const stripePlans = await paymentService.getSubscriptionPlans();
      if (stripePlans && stripePlans.length > 0) {
        console.log(chalk.green(`✓ Found ${stripePlans.length} plans from Stripe`));
        
        // Display plans from Stripe
        for (const plan of stripePlans) {
          console.log('\n' + chalk.cyan(`${plan.name} Plan (${plan.planType}):`));
          console.log('Price:', `${plan.price} ${plan.currency}/${plan.interval}`);
          console.log('Features:', plan.features.join(', '));
          
          if (plan.limits) {
            console.log('Limits:');
            for (const [key, value] of Object.entries(plan.limits)) {
              console.log(`  - ${key}: ${value}`);
            }
          }
        }
      } else {
        console.log(chalk.yellow('No plans found from Stripe, using default values'));
      }
    } catch (error) {
      console.log(chalk.yellow('Could not fetch plans from Stripe, using default values'));
      console.error(chalk.gray('Error details:'), error);
    }
  } catch (error) {
    console.log(chalk.yellow('Payment service not available, using default values'));
  }
  
  // Test free plan
  console.log('\n' + chalk.cyan('Free Plan (Default Values):'));
  console.log('Storage Limit:', getResourceLimit('free', 'Storage'), 'MB');
  console.log('AI Interactions Limit:', getResourceLimit('free', 'AIInteractions'));
  console.log('API Calls Limit:', getResourceLimit('free', 'APICalls'));
  console.log('Features:', getPlanFeatures('free').join(', '));
  
  // Test premium plan
  console.log('\n' + chalk.cyan('Premium Plan (Default Values):'));
  console.log('Storage Limit:', getResourceLimit('premium', 'Storage'), 'MB');
  console.log('AI Interactions Limit:', getResourceLimit('premium', 'AIInteractions'));
  console.log('API Calls Limit:', getResourceLimit('premium', 'APICalls'));
  console.log('Features:', getPlanFeatures('premium').join(', '));
  
  // Test enterprise plan
  console.log('\n' + chalk.cyan('Enterprise Plan (Default Values):'));
  console.log('Storage Limit:', getResourceLimit('enterprise', 'Storage'), 'MB');
  console.log('AI Interactions Limit:', getResourceLimit('enterprise', 'AIInteractions'));
  console.log('API Calls Limit:', getResourceLimit('enterprise', 'APICalls'));
  console.log('Features:', getPlanFeatures('enterprise').join(', '));
  
  // Test feature access
  console.log('\n' + chalk.yellow('Testing Feature Access:'));
  
  const features = [
    'basic_ai', 
    'advanced_ai', 
    'premium_ai', 
    'basic_storage', 
    'advanced_storage', 
    'unlimited_storage',
    'basic_analytics',
    'advanced_analytics',
    'priority_support',
    'team_collaboration'
  ];
  
  const plans = ['free', 'premium', 'enterprise'];
  
  // Create a table of feature access by plan
  console.log('\n' + chalk.cyan('Feature Access by Plan:'));
  console.log('Feature'.padEnd(25) + '| Free'.padEnd(10) + '| Premium'.padEnd(12) + '| Enterprise');
  console.log('-'.repeat(60));
  
  for (const feature of features) {
    let line = feature.padEnd(25);
    
    for (const plan of plans) {
      const hasAccess = hasFeatureAccess(plan, feature);
      line += `| ${hasAccess ? chalk.green('✓') : chalk.red('✗')} `.padEnd(plan === 'free' ? 10 : 12);
    }
    
    console.log(line);
  }
  
  // Test invalid plan type (should default to free)
  console.log('\n' + chalk.yellow('Testing Invalid Plan Type:'));
  console.log('Storage Limit for "invalid" plan:', getResourceLimit('invalid', 'Storage'), 'MB (should default to free plan)');
  console.log('Has access to basic_ai with "invalid" plan:', hasFeatureAccess('invalid', 'basic_ai'), '(should default to free plan)');
  
  // Test invalid resource name
  console.log('\n' + chalk.yellow('Testing Invalid Resource Name:'));
  console.log('Limit for "InvalidResource" in premium plan:', getResourceLimit('premium', 'InvalidResource'), '(should default to 0)');
  
  // Simulate users with different plans
  console.log('\n' + chalk.yellow('Simulating User Interactions:'));
  
  const users = [
    { id: 'user1', name: 'Free User', plan: 'free', usage: { storage: 8, aiInteractions: 18, apiCalls: 90 } },
    { id: 'user2', name: 'Free User (at limit)', plan: 'free', usage: { storage: 10, aiInteractions: 20, apiCalls: 100 } },
    { id: 'user3', name: 'Premium User', plan: 'premium', usage: { storage: 30, aiInteractions: 50, apiCalls: 500 } },
    { id: 'user4', name: 'Enterprise User', plan: 'enterprise', usage: { storage: 200, aiInteractions: 300, apiCalls: 5000 } }
  ];
  
  for (const user of users) {
    console.log('\n' + chalk.cyan(`Testing ${user.name} (${user.plan} plan):`));
    
    // Check resource limits
    const storageLimit = getResourceLimit(user.plan, 'Storage');
    const aiLimit = getResourceLimit(user.plan, 'AIInteractions');
    const apiLimit = getResourceLimit(user.plan, 'APICalls');
    
    console.log('Storage:', `${user.usage.storage}/${storageLimit} MB`, 
      user.usage.storage >= storageLimit ? chalk.red('(AT LIMIT)') : 
      user.usage.storage >= storageLimit * 0.8 ? chalk.yellow('(NEAR LIMIT)') : '');
    
    console.log('AI Interactions:', `${user.usage.aiInteractions}/${aiLimit}`, 
      user.usage.aiInteractions >= aiLimit ? chalk.red('(AT LIMIT)') : 
      user.usage.aiInteractions >= aiLimit * 0.8 ? chalk.yellow('(NEAR LIMIT)') : '');
    
    console.log('API Calls:', `${user.usage.apiCalls}/${apiLimit}`, 
      user.usage.apiCalls >= apiLimit ? chalk.red('(AT LIMIT)') : 
      user.usage.apiCalls >= apiLimit * 0.8 ? chalk.yellow('(NEAR LIMIT)') : '');
    
    // Check feature access
    console.log('\nFeature Access:');
    console.log('Basic AI:', hasFeatureAccess(user.plan, 'basic_ai') ? chalk.green('✓') : chalk.red('✗'));
    console.log('Advanced AI:', hasFeatureAccess(user.plan, 'advanced_ai') ? chalk.green('✓') : chalk.red('✗'));
    console.log('Premium AI:', hasFeatureAccess(user.plan, 'premium_ai') ? chalk.green('✓') : chalk.red('✗'));
    console.log('Advanced Analytics:', hasFeatureAccess(user.plan, 'advanced_analytics') ? chalk.green('✓') : chalk.red('✗'));
    console.log('Team Collaboration:', hasFeatureAccess(user.plan, 'team_collaboration') ? chalk.green('✓') : chalk.red('✗'));
    
    // Simulate user actions
    console.log('\nSimulating User Actions:');
    
    // Try to use AI Assistant
    if (hasFeatureAccess(user.plan, 'basic_ai')) {
      if (user.usage.aiInteractions >= aiLimit) {
        console.log('AI Assistant:', chalk.red('BLOCKED - Usage limit reached'));
      } else {
        console.log('AI Assistant:', chalk.green('ALLOWED'));
      }
    } else {
      console.log('AI Assistant:', chalk.red('BLOCKED - Feature not available in plan'));
    }
    
    // Try to use Advanced Analytics
    if (hasFeatureAccess(user.plan, 'advanced_analytics')) {
      console.log('Advanced Analytics:', chalk.green('ALLOWED'));
    } else {
      console.log('Advanced Analytics:', chalk.red('BLOCKED - Feature not available in plan'));
    }
    
    // Try to use Team Collaboration
    if (hasFeatureAccess(user.plan, 'team_collaboration')) {
      console.log('Team Collaboration:', chalk.green('ALLOWED'));
    } else {
      console.log('Team Collaboration:', chalk.red('BLOCKED - Feature not available in plan'));
    }
  }
  
  // Test component rendering scenarios
  console.log('\n' + chalk.yellow('Testing Component Rendering Scenarios:'));
  
  for (const user of users) {
    console.log('\n' + chalk.cyan(`${user.name} UI Components:`));
    
    // AI Assistant component
    if (hasFeatureAccess(user.plan, 'basic_ai')) {
      if (user.usage.aiInteractions >= aiLimit) {
        console.log('AI Assistant Component:', chalk.yellow('Render with usage limit warning'));
      } else if (user.usage.aiInteractions >= aiLimit * 0.8) {
        console.log('AI Assistant Component:', chalk.blue('Render with approaching limit warning'));
      } else {
        console.log('AI Assistant Component:', chalk.green('Render normally'));
      }
    } else {
      console.log('AI Assistant Component:', chalk.red('Render UpgradePrompt component'));
    }
    
    // Advanced Analytics component
    if (hasFeatureAccess(user.plan, 'advanced_analytics')) {
      console.log('Advanced Analytics Component:', chalk.green('Render normally'));
    } else {
      console.log('Advanced Analytics Component:', chalk.red('Render with PremiumBadge and UpgradePrompt'));
    }
    
    // Team Collaboration component
    if (hasFeatureAccess(user.plan, 'team_collaboration')) {
      console.log('Team Collaboration Component:', chalk.green('Render normally'));
    } else {
      console.log('Team Collaboration Component:', chalk.red('Render with PremiumBadge and UpgradePrompt'));
    }
    
    // Usage Stats component
    const storageLimit = getResourceLimit(user.plan, 'Storage');
    const aiLimit = getResourceLimit(user.plan, 'AIInteractions');
    const apiLimit = getResourceLimit(user.plan, 'APICalls');
    
    console.log('Usage Stats Component:');
    console.log('  - Storage Bar:', 
      user.usage.storage >= storageLimit ? chalk.red('Red (at limit)') : 
      user.usage.storage >= storageLimit * 0.8 ? chalk.yellow('Yellow (near limit)') : 
      chalk.green('Blue (normal)'));
    
    console.log('  - AI Interactions Bar:', 
      user.usage.aiInteractions >= aiLimit ? chalk.red('Red (at limit)') : 
      user.usage.aiInteractions >= aiLimit * 0.8 ? chalk.yellow('Yellow (near limit)') : 
      chalk.green('Blue (normal)'));
    
    console.log('  - API Calls Bar:', 
      user.usage.apiCalls >= apiLimit ? chalk.red('Red (at limit)') : 
      user.usage.apiCalls >= apiLimit * 0.8 ? chalk.yellow('Yellow (near limit)') : 
      chalk.green('Blue (normal)'));
  }
  
  console.log('\n' + chalk.green('✓ Plan feature testing complete!'));
}

testPlanFeatures().catch(console.error);
