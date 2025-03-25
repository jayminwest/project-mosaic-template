"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  children: React.ReactNode
}

const Tabs = React.forwardRef<
  HTMLDivElement,
  TabsProps
>(({ defaultValue, value, onValueChange, className, children, ...props }, ref) => {
  const [tabValue, setTabValue] = React.useState(value || defaultValue || "");
  
  React.useEffect(() => {
    if (value !== undefined) {
      setTabValue(value);
    }
  }, [value]);

  const handleValueChange = React.useCallback((newValue: string) => {
    if (value === undefined) {
      setTabValue(newValue);
    }
    onValueChange?.(newValue);
  }, [onValueChange, value]);

  return (
    <div ref={ref} className={cn("w-full", className)} {...props}>
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return child;
        
        if (child.type === TabsList || child.type === TabsContent) {
          return React.cloneElement(child, {
            ...child.props,
            __tabsValue: tabValue,
            __onValueChange: handleValueChange,
          });
        }
        
        return child;
      })}
    </div>
  );
});
Tabs.displayName = "Tabs";

interface TabsListProps {
  className?: string
  children: React.ReactNode
  __tabsValue?: string
  __onValueChange?: (value: string) => void
}

const TabsList = React.forwardRef<
  HTMLDivElement,
  TabsListProps
>(({ className, children, __tabsValue, __onValueChange, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    >
      {React.Children.map(children, child => {
        if (!React.isValidElement(child) || child.type !== TabsTrigger) return child;
        
        return React.cloneElement(child, {
          ...child.props,
          __tabsValue,
          __onValueChange,
        });
      })}
    </div>
  );
});
TabsList.displayName = "TabsList";

interface TabsTriggerProps {
  value: string
  className?: string
  disabled?: boolean
  children: React.ReactNode
  __tabsValue?: string
  __onValueChange?: (value: string) => void
}

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  TabsTriggerProps
>(({ className, value, disabled, children, __tabsValue, __onValueChange, ...props }, ref) => {
  const isActive = __tabsValue === value;
  
  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      data-state={isActive ? "active" : "inactive"}
      onClick={() => __onValueChange?.(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive ? "bg-background text-foreground shadow-sm" : "",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps {
  value: string
  className?: string
  children: React.ReactNode
  __tabsValue?: string
}

const TabsContent = React.forwardRef<
  HTMLDivElement,
  TabsContentProps
>(({ className, value, children, __tabsValue, ...props }, ref) => {
  const isActive = __tabsValue === value;
  
  if (!isActive) return null;
  
  return (
    <div
      ref={ref}
      role="tabpanel"
      data-state={isActive ? "active" : "inactive"}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent }
