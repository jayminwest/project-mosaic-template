import { AuthProvider, createAuthService, AuthConfig } from "@/lib/auth/auth-service";
import { PaymentProvider, createPaymentService, PaymentServiceConfig } from "@/lib/payment/payment-service";
import { getAuthConfig, getPaymentConfig } from "@/lib/config/service-config";

export class ServiceProvider {
  private static instance: ServiceProvider;
  private authService: AuthProvider;
  private paymentService: PaymentProvider;
  
  private constructor(authConfig: AuthConfig = {}, paymentConfig: PaymentServiceConfig = {}) {
    this.authService = createAuthService(authConfig);
    this.paymentService = createPaymentService(paymentConfig);
  }
  
  public static getInstance(authConfig: AuthConfig = {}, paymentConfig: PaymentServiceConfig = {}): ServiceProvider {
    if (!ServiceProvider.instance) {
      const mergedAuthConfig = { ...getAuthConfig(), ...authConfig };
      const mergedPaymentConfig = { ...getPaymentConfig(), ...paymentConfig };
      ServiceProvider.instance = new ServiceProvider(mergedAuthConfig, mergedPaymentConfig);
    }
    return ServiceProvider.instance;
  }
  
  public getAuthService(): AuthProvider {
    return this.authService;
  }
  
  public getPaymentService(): PaymentProvider {
    return this.paymentService;
  }
}

export function getServiceProvider(
  authConfig: AuthConfig = {}, 
  paymentConfig: PaymentServiceConfig = {}
): ServiceProvider {
  return ServiceProvider.getInstance(authConfig, paymentConfig);
}
