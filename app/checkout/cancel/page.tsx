'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { useConfig } from '@/lib/config/useConfig';

export default function CheckoutCancelPage() {
  const router = useRouter();
  const { productConfig } = useConfig();
  
  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-amber-500" />
          </div>
          <CardTitle className="text-center text-2xl">Checkout Cancelled</CardTitle>
          <CardDescription className="text-center">
            Your subscription has not been processed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center">
            You can try again whenever you're ready to upgrade to {productConfig.name} premium features.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => router.push('/')}>
            Back to Home
          </Button>
          <Button onClick={() => router.push('/pricing')}>
            View Plans
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { useConfig } from '@/lib/config/useConfig';

export default function CheckoutCancelPage() {
  const router = useRouter();
  const { productConfig } = useConfig();
  
  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-amber-500" />
          </div>
          <CardTitle className="text-center text-2xl">Checkout Cancelled</CardTitle>
          <CardDescription className="text-center">
            Your subscription has not been processed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center">
            You can try again whenever you're ready to upgrade to {productConfig.name} premium features.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => router.push('/')}>
            Back to Home
          </Button>
          <Button onClick={() => router.push('/pricing')}>
            View Plans
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
