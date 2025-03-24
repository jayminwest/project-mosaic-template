export function validateEnvironment(): { 
  valid: boolean; 
  missingRequired: string[]; 
  missingOptional: string[]; 
} {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ];

  const optionalVars = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'RESEND_API_KEY',
    'EMAIL_FROM',
  ];

  const featureSpecificVars = {
    enableAI: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'],
    enableEmail: ['RESEND_API_KEY', 'EMAIL_FROM'],
  };

  const missingRequired = requiredVars.filter(
    varName => !process.env[varName]
  );

  const missingOptional = optionalVars.filter(
    varName => !process.env[varName]
  );

  if (missingRequired.length > 0) {
    console.warn(`Missing required environment variables: ${missingRequired.join(', ')}`);
    console.warn('Some features may not work correctly.');
  }

  if (missingOptional.length > 0) {
    console.info(`Missing optional environment variables: ${missingOptional.join(', ')}`);
    console.info('Some features may be disabled.');
  }

  // Check feature-specific variables
  Object.entries(featureSpecificVars).forEach(([feature, vars]) => {
    const missingVars = vars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      console.info(`Feature '${feature}' may be limited due to missing: ${missingVars.join(', ')}`);
    }
  });

  return {
    valid: missingRequired.length === 0,
    missingRequired,
    missingOptional,
  };
}
