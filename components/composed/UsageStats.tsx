"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
          {usageData.map((item) => (
            <div key={item.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.name}</span>
                <span className="text-sm text-muted-foreground">
                  {item.current} / {item.limit} {item.unit}
                </span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.current / item.limit > 0.8 ? 'bg-destructive' : 'bg-primary'}`}
                  style={{ width: `${Math.min(100, (item.current / item.limit) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
