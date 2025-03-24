import { AuthConfig } from "@/lib/auth/auth-service";
import { PaymentServiceConfig } from "@/lib/payment/payment-service";

export function getAuthConfig(overrides: Partial<AuthConfig> = {}): AuthConfig {
  return {
    redirectUrl: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : '',
    providers: ['google', 'github'],
    ...overrides,
  };
}

export function getPaymentConfig(overrides: Partial<PaymentServiceConfig> = {}): PaymentServiceConfig {
  return {
    apiUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    successUrl: typeof window !== 'undefined' ? `${window.location.origin}/profile?success=true` : '',
    cancelUrl: typeof window !== 'undefined' ? `${window.location.origin}/profile?canceled=true` : '',
    ...overrides,
  };
}
