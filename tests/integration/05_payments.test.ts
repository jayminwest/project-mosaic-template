import { supabase, supabaseServiceClient } from "../test-utils/supabase-client";
import { describe, expect, test } from "@jest/globals";
import Stripe from "stripe";
import {
  TestUser,
  getOrCreateTestUser,
  cleanupTestUser,
} from "../test-utils/user-testing-utils";
import {
  setUserSubscriptionTier,
  TASK_LIMITS,
} from "../test-utils/limit-testing-utils";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const WEBHOOK_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/stripe-webhook`;
const TEST_USER_GREG = {
  name: "Greg (Test User)",
  email: "test-user.greg@pixegami.io",
  password: "Test123!@#Greg",
};

describe("Suite 6: Stripe Payments Integration", () => {
  let customerId: string;
  let testUser: TestUser | null;
  let paymentMethodId: string;

  const createPaymentMethod = async () => {
    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: { token: "tok_visa" },
    });
    paymentMethodId = paymentMethod.id;

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    console.log(
      `💳 Created Payment Method ${paymentMethodId} for Customer: ${customerId}`
    );
  };

  const sendWebhookEvent = async (event: any) => {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Stripe-Signature": stripe.webhooks.generateTestHeaderString({
          payload: JSON.stringify(event),
          secret: process.env.STRIPE_WEBHOOK_SECRET!,
        }),
      },
      body: JSON.stringify(event),
    });
    console.log(`👉 Webhook Response: ${response.status}`);
    return response;
  };

  const createSubscription = async () => {
    if (!paymentMethodId) {
      throw new Error("Payment method ID not set");
    }
    console.log(`👉 Creating Subscription with Payment ID: ${paymentMethodId}`);
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: process.env.STRIPE_PRICE_ID }],
      trial_period_days: 0,
      default_payment_method: paymentMethodId,
    });
    return subscription;
  };

  beforeAll(async () => {
    testUser = await getOrCreateTestUser(TEST_USER_GREG);

    // Get the corresponding Stripe customer ID.
    const { data: profile } = await supabaseServiceClient
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", testUser?.id)
      .single();

    if (!profile) {
      throw new Error("No profile found");
    }

    customerId = profile.stripe_customer_id;
    console.log(`🔒 Created User with Stripe Customer ID: ${customerId}`);
    await createPaymentMethod();
  }, 15_000);

  afterAll(async () => {
    if (testUser) {
      await cleanupTestUser(testUser.id);
    }
  });

  test("subscription updates user to premium", async () => {
    // Set user to "free" tier
    await setUserSubscriptionTier(testUser!.id, "free");

    // Create and complete subscription
    const subscription = await createSubscription();

    // Simulate checkout.session.completed webhook
    const event = {
      type: "checkout.session.completed",
      data: {
        object: {
          subscription: subscription.id,
          customer: customerId,
        },
      },
    };
    console.log(`👉 Webhook Event Created: ${event.type}`);

    const response = await sendWebhookEvent(event);
    expect(response.status).toBe(200);

    // Verify database update
    const { data: profile } = await supabase
      .from("profiles")
      .select()
      .eq("stripe_customer_id", customerId)
      .single();

    expect(profile.subscription_plan).toBe("premium");
  }, 30_000);

  test("deleted subscription updates user to free", async () => {
    // Create a subscription
    await setUserSubscriptionTier(testUser!.id, "premium");
    const subscription = await createSubscription();
    console.log(`✅ Created Subscription: ${subscription.id}`);

    // Delete the subscription
    await stripe.subscriptions.cancel(subscription.id);
    console.log(`✅ Cancel Subscription: ${subscription.id}`);

    // Simulate customer.subscription.deleted webhook
    const event = {
      type: "customer.subscription.deleted",
      data: {
        object: {
          id: subscription.id,
          customer: customerId,
        },
      },
    };
    console.log(`👉 Webhook Event Created: ${event.type}`);
    const response = await sendWebhookEvent(event);
    expect(response.status).toBe(200);

    // Verify database update
    const { data: profile } = await supabase
      .from("profiles")
      .select()
      .eq("stripe_customer_id", customerId)
      .single();

    expect(profile.subscription_plan).toBe("free");
    expect(profile.tasks_limit).toBe(TASK_LIMITS.FREE_TIER);
  }, 30_000);
});
import { createPaymentService } from '@/lib/payment/payment-service';
import { getOrCreateTestUser, cleanupTestUser } from '../test-utils/user-testing-utils';
import { setUserSubscriptionTier } from '../test-utils/limit-testing-utils';

describe('Payment Service', () => {
  let testUser: any;
  
  beforeAll(async () => {
    // Create a test user
    const result = await getOrCreateTestUser({
      email: 'payment-test@example.com',
      password: 'password123',
      name: 'Payment Test User'
    });
    
    testUser = result.user;
  });
  
  afterAll(async () => {
    // Clean up the test user
    await cleanupTestUser(testUser?.user_id);
  });
  
  it('should retrieve subscription plans', async () => {
    const paymentService = createPaymentService();
    const plans = await paymentService.getSubscriptionPlans();
    
    expect(plans.length).toBeGreaterThan(0);
    expect(plans[0]).toHaveProperty('id');
    expect(plans[0]).toHaveProperty('name');
    expect(plans[0]).toHaveProperty('features');
  });
  
  it('should get the current plan for a user', async () => {
    const paymentService = createPaymentService();
    const plan = await paymentService.getCurrentPlan(testUser.user_id);
    
    // By default, users start on the free plan
    expect(plan?.planType).toBe('free');
  });
  
  it('should check feature access correctly', async () => {
    const paymentService = createPaymentService();
    
    // Free tier should have access to basic features
    const hasBasicAccess = await paymentService.hasFeatureAccess(testUser.user_id, 'basic');
    expect(hasBasicAccess).toBe(true);
    
    // Free tier should not have access to premium features
    const hasPremiumAccess = await paymentService.hasFeatureAccess(testUser.user_id, 'premium');
    expect(hasPremiumAccess).toBe(false);
    
    // Set user to premium tier
    await setUserSubscriptionTier(testUser.user_id, 'premium');
    
    // Premium tier should have access to premium features
    const hasPremiumAccessAfterUpgrade = await paymentService.hasFeatureAccess(testUser.user_id, 'premium');
    expect(hasPremiumAccessAfterUpgrade).toBe(true);
  });
  
  it('should get subscription status', async () => {
    const paymentService = createPaymentService();
    const status = await paymentService.getSubscriptionStatus(testUser.user_id);
    
    expect(status).toHaveProperty('isActive');
    expect(status).toHaveProperty('willRenew');
    expect(status).toHaveProperty('status');
  });
  
  // Note: We can't easily test actual subscription creation/cancellation in tests
  // without creating real Stripe charges, so we'll mock those or test them manually
});
