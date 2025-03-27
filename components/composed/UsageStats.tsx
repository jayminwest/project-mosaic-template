"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from "lucide-react";

interface UsageItem {
  name: string;
  current: number;
  limit: number;
  unit?: string;
}

interface UsageStatsProps {
  usageData: UsageItem[];
  title?: string;
  description?: string;
}

export function UsageStats({ 
  usageData, 
  title = "Resource Usage", 
  description = "Your current resource usage and limits."
}: UsageStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {usageData.map((item) => {
            const percentage = (item.current / item.limit) * 100;
            const isNearLimit = percentage >= 80;
            
            return (
              <div key={item.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center">
                    {item.name}
                    {isNearLimit && (
                      <AlertCircle className="h-4 w-4 ml-1 text-amber-500" />
                    )}
                  </span>
                  <span className={`text-sm ${isNearLimit ? "font-medium text-amber-500" : "text-muted-foreground"}`}>
                    {item.current} / {item.limit} {item.unit}
                  </span>
                </div>
                <div className={`h-2 w-full ${isNearLimit ? 'bg-amber-100' : 'bg-secondary'} rounded-full overflow-hidden`}>
                  <div 
                    className={`h-full ${isNearLimit ? 'bg-amber-500' : item.current / item.limit > 0.5 ? 'bg-primary' : 'bg-primary'}`}
                    style={{ width: `${Math.min(100, (item.current / item.limit) * 100)}%` }}
                  />
                </div>
                {isNearLimit && (
                  <p className="text-xs text-amber-500 mt-1">
                    You're approaching your {item.name.toLowerCase()} limit. Consider upgrading your plan.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
