import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfig } from "@/lib/config/useConfig";

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'table' | 'form';
  count?: number;
}

export function LoadingSkeleton({ type = 'card', count = 1 }: LoadingSkeletonProps) {
  const { theme } = useConfig();
  
  // Card skeleton
  if (type === 'card') {
    return (
      <div className="space-y-6">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="w-full">
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-28 mr-2" />
              <Skeleton className="h-10 w-28" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  // List skeleton
  if (type === 'list') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-md">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full sm:w-1/2" />
              <Skeleton className="h-4 w-5/6 sm:w-1/3" />
            </div>
            <Skeleton className="h-8 w-8 sm:h-10 sm:w-10" />
          </div>
        ))}
      </div>
    );
  }
  
  // Table skeleton
  if (type === 'table') {
    return (
      <div className="w-full border rounded-md overflow-hidden">
        <div className="bg-muted/20 p-4">
          <Skeleton className="h-6 w-full sm:w-1/3" />
        </div>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center border-t p-4 space-x-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        ))}
      </div>
    );
  }
  
  // Form skeleton
  if (type === 'form') {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
    );
  }
  
  // Default fallback
  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    </div>
  );
}
