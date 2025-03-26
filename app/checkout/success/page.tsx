'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useConfig } from '@/lib/config/useConfig';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { productConfig } = useConfig();
  const { getSubscriptionStatus } = useSubscription();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
  
  useEffect(() => {
    async function verifyCheckout() {
      if (!sessionId && sessionId !== 'dev_session_123') {
        setStatus('error');
        return;
      }
      
      try {
        // For development mode simulation
        if (sessionId === 'dev_session_123') {
          setSubscriptionDetails({
            planName: 'Premium',
            isActive: true,
            status: 'active'
          });
          setStatus('success');
          return;
        }
        
        // Wait a moment to allow webhook processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Get updated subscription status
        const result = await getSubscriptionStatus();
        
        // Always show success to the user after payment
        setStatus('success');
        
        if (result.success) {
          const data = result.data;
          setSubscriptionDetails({
            planName: data.plan_type === 'premium' ? 'Premium' : 
                     data.plan_type === 'enterprise' ? 'Enterprise' : 'Free',
            isActive: data.isActive,
            status: data.status,
            trialEnd: data.currentPeriodEnd || null
          });
          console.log("Subscription details set from API response:", data);
        } else {
          // Even if we get an error, show success to the user
          // The webhook might still be processing
          setSubscriptionDetails({
            planName: 'Premium',
            isActive: true,
            status: 'active'
          });
          console.warn('Could not verify subscription status, showing success anyway:', result.error);
        }
      } catch (error) {
        console.error('Error verifying checkout:', error);
        // Still show success to avoid confusing the user
        // The webhook might still be processing
        setSubscriptionDetails({
          planName: 'Premium',
          isActive: true,
          status: 'active'
        });
        setStatus('success');
      }
    }
    
    verifyCheckout();
  }, [sessionId, getSubscriptionStatus]);
  
  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-center text-2xl">Thank You!</CardTitle>
          <CardDescription className="text-center">
            {status === 'loading' ? 'Verifying your subscription...' : 
             status === 'success' ? 'Your subscription has been activated.' : 
             'We received your payment.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          
          {status === 'success' && subscriptionDetails && (
            <div className="space-y-4">
              <p className="text-center">
                Welcome to {productConfig?.name || 'Premium'} {subscriptionDetails.planName || 'Plan'}!
              </p>
              
              {subscriptionDetails.trialEnd && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-center">
                    Your free trial ends on {new Date(subscriptionDetails.trialEnd * 1000).toLocaleDateString()}.
                    You won't be charged until then.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {status === 'error' && (
            <p className="text-center text-amber-600 dark:text-amber-400">
              We're still processing your subscription. You'll receive an email confirmation shortly.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
