"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UpgradePromptProps {
  feature: string;
  description?: string;
}

export function UpgradePrompt({ feature, description }: UpgradePromptProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{feature} - Premium Feature</CardTitle>
        <CardDescription>
          {description || `Access to ${feature} requires a premium subscription.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-8">
        <Button asChild>
          <a href="/pricing">Upgrade Now</a>
        </Button>
      </CardContent>
    </Card>
  );
}
