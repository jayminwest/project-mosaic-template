import { Badge } from "./badge";
import { LockIcon, StarIcon } from "lucide-react";

interface PremiumBadgeProps {
  type?: 'premium' | 'locked';
  className?: string;
}

export function PremiumBadge({ type = 'premium', className = '' }: PremiumBadgeProps) {
  if (type === 'locked') {
    return (
      <Badge variant="outline" className={`bg-muted/50 text-muted-foreground ${className}`}>
        <LockIcon className="h-3 w-3 mr-1" />
        Premium
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className={`bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 ${className}`}>
      <StarIcon className="h-3 w-3 mr-1 fill-amber-500" />
      Premium
    </Badge>
  );
}
