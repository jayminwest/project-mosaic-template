import { SubscriptionPlan } from './types';

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Basic features for personal use",
    priceId: "", // No price ID for free plan
    price: 0,
    currency: "USD",
    interval: "month",
    planType: "free",
    features: [
      "Up to 10 resources",
      "5MB storage",
      "Basic features"
    ]
  },
  {
    id: "premium",
    name: "Premium",
    description: "Advanced features for professionals",
    priceId: "price_1234567890", // Will be updated by setup script
    price: 9.99,
    currency: "USD",
    interval: "month",
    planType: "premium",
    features: [
      "Up to 100 resources",
      "50MB storage",
      "Advanced features",
      "Priority support"
    ]
  }
];
