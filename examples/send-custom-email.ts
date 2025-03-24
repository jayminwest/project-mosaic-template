import { emailService } from '../lib/email/email-service';

/**
 * Example function for sending a custom transactional email
 * This demonstrates how to use the custom email service for non-auth emails
 */
export async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  orderId: string,
  orderTotal: number,
  productName: string
): Promise<boolean> {
  try {
    // You could create a specific template for order confirmations
    // For this example, we'll use the welcome template with custom props
    const result = await emailService.sendEmail({
      to: email,
      subject: `Your ${productName} Order Confirmation #${orderId}`,
      template: 'welcome', // Ideally you'd create an OrderConfirmation template
      props: {
        username: name,
        productName,
        actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}`,
        // You can pass additional props that your template can use
        orderId,
        orderTotal: orderTotal.toFixed(2),
        orderDate: new Date().toLocaleDateString()
      }
    });
    
    if (result.success) {
      console.log(`Order confirmation email sent to ${email}, Order ID: ${orderId}`);
      return true;
    } else {
      console.error(`Failed to send order confirmation email: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
}

/**
 * Example function for sending a subscription renewal reminder
 */
export async function sendRenewalReminderEmail(
  email: string,
  name: string,
  subscriptionId: string,
  renewalDate: Date,
  productName: string
): Promise<boolean> {
  try {
    const result = await emailService.sendEmail({
      to: email,
      subject: `Your ${productName} subscription renews soon`,
      template: 'welcome', // Ideally you'd create a RenewalReminder template
      props: {
        username: name,
        productName,
        actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription`,
        // Custom props
        renewalDate: renewalDate.toLocaleDateString(),
        daysRemaining: Math.ceil((renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      }
    });
    
    return result.success;
  } catch (error) {
    console.error('Error sending renewal reminder email:', error);
    return false;
  }
}

/**
 * Example of how to use these functions in your application
 */
/*
// In your order processing code
async function processOrder(userId: string, orderDetails: any) {
  // Process the order...
  
  // Get user information
  const { data: userData } = await supabase
    .from('profiles')
    .select('name')
    .eq('user_id', userId)
    .single();
  
  // Get user email
  const { data: { user } } = await supabase.auth.admin.getUserById(userId);
  
  if (user && userData) {
    // Send confirmation email
    await sendOrderConfirmationEmail(
      user.email,
      userData.name,
      orderDetails.orderId,
      orderDetails.total,
      'Your Product Name'
    );
  }
}
*/
