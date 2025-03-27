# Stripe Customer Portal Configuration Guide

This guide provides detailed instructions for configuring the Stripe Customer Portal for Project Mosaic's subscription management system.

## Overview

The Stripe Customer Portal allows your subscribers to:
- Update payment methods
- View billing history
- Change subscription plans
- Cancel subscriptions

For Project Mosaic to properly manage subscriptions, you need to configure the Stripe Customer Portal in your Stripe dashboard.

## Configuration Steps

### 1. Access Stripe Customer Portal Settings

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Settings** > **Billing** > **Customer Portal**
3. If you're in test mode, make sure the "Test mode" toggle is enabled

### 2. Configure Basic Settings

1. **Business Information**
   - Add your business name and logo
   - Configure your business address and support contact information

2. **Branding**
   - Set your brand colors to match your application
   - Configure email settings for portal-related notifications

### 3. Configure Features

1. **Customer Update Permissions**
   - Enable "Payment methods" to allow customers to update their payment information
   - Enable "Customer details" if you want customers to update their information

2. **Subscription Management**
   - Enable "Cancel subscriptions" to allow customers to cancel their subscriptions
   - Configure cancellation options:
     - Immediate cancellation
     - End of billing period
     - Optional feedback collection

3. **Products and Pricing**
   - Enable "Update subscriptions" to allow customers to switch between plans
   - Select which products and prices customers can switch between
   - Configure proration settings for plan changes

4. **Additional Features**
   - Configure invoice history visibility
   - Set up customer portal session duration
   - Enable/disable receipt emails

### 4. Save Your Configuration

After configuring all settings, click "Save" to apply your changes.

## Testing the Customer Portal

1. Create a test customer with an active subscription
2. Generate a test portal link:
   - Go to **Customers** in your Stripe Dashboard
   - Select your test customer
   - Click "Create portal link"
   - Use the generated link to access the portal as that customer

3. Test all enabled features:
   - Update payment method
   - Change subscription plan
   - Cancel subscription
   - View invoice history

## Troubleshooting

### Common Error: No Configuration Provided

If you encounter this error:
```
Error: No configuration provided and your test mode default configuration has not been created. 
Provide a configuration or create your default by saving your customer portal settings in test mode 
at https://dashboard.stripe.com/test/settings/billing/portal.
```

This means you haven't saved your Customer Portal configuration in Stripe. Follow these steps:

1. Go to [https://dashboard.stripe.com/test/settings/billing/portal](https://dashboard.stripe.com/test/settings/billing/portal)
2. Configure the basic settings (you can update them later)
3. Click "Save" at the bottom of the page
4. Try accessing the customer portal again

### Other Common Issues

1. **Portal Link Not Working**
   - Verify the customer ID is correct
   - Check that the customer has an active subscription
   - Ensure your API key has the correct permissions

2. **Customers Can't Update Subscriptions**
   - Verify you've enabled the "Update subscriptions" feature
   - Check that you've selected the correct products and prices
   - Ensure your product configurations are correct

3. **Branding Not Applied**
   - Clear your browser cache
   - Verify you saved your branding settings
   - Check that you're using the correct Stripe account (test vs. production)

## Integration with Project Mosaic

Project Mosaic handles the Stripe Customer Portal integration through:

1. The `create-stripe-session` Edge Function, which creates portal sessions for existing subscribers
2. The `useSubscription` hook, which provides the frontend interface for managing subscriptions
3. Error handling for cases where the portal is not configured

If the Customer Portal is not configured, Project Mosaic will display an error message with instructions on how to configure it.

## Going Live

When you're ready to go live with your application:

1. Configure the Customer Portal in your Stripe production environment
2. Update your API keys to use production keys
3. Test the entire subscription flow in production mode
4. Monitor customer portal usage and feedback

Remember that test mode and production mode have separate configurations. You'll need to configure the Customer Portal in both environments.
