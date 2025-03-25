"use client";

import { useAuth } from "@/hooks/useAuth";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function HelpPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Help & Support</h1>
      
      <div className="grid grid-cols-1 gap-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">How do I update my profile?</h3>
                <p className="text-muted-foreground">
                  You can update your profile by going to the Profile page and clicking the Edit button.
                </p>
              </div>
              <div>
                <h3 className="font-medium">How do I upgrade my subscription?</h3>
                <p className="text-muted-foreground">
                  You can upgrade your subscription by going to the Profile page and clicking the Manage Subscription button.
                </p>
              </div>
              <div>
                <h3 className="font-medium">How do I reset my password?</h3>
                <p className="text-muted-foreground">
                  You can reset your password by logging out and clicking the "Forgot password" link on the login page.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Need help with something not covered in the FAQs? Contact our support team.
            </p>
            <Button variant="outline">
              Email Support
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Check out our documentation for detailed guides and tutorials.
            </p>
            <Button variant="outline">
              View Documentation
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
