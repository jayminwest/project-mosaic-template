"use client";

import { Button } from "@/components/ui/button";

interface FeatureLimitProps {
  title: string;
  description: string;
  current: number;
  limit: number;
  unit?: string;
  showUpgradeLink?: boolean;
}

export function FeatureLimit({
  title,
  description,
  current,
  limit,
  unit = '',
  showUpgradeLink = true
}: FeatureLimitProps) {
  const percentage = (current / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;
  
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">{title}</h3>
        <span className={`text-sm ${isAtLimit ? 'text-red-500' : isNearLimit ? 'text-amber-500' : ''}`}>
          {current}/{limit} {unit}
        </span>
      </div>
      
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-primary'}`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
      
      <p className="text-sm text-muted-foreground">{description}</p>
      
      {(isNearLimit || isAtLimit) && showUpgradeLink && (
        <div className="pt-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/pricing">Upgrade Plan</a>
          </Button>
        </div>
      )}
    </div>
  );
}
