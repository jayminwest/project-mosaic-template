import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { useConfig } from "@/lib/config/useConfig";

// Default routes
const PUBLIC_ROUTES = ["/"];
const DEFAULT_AUTHENTICATED_ROUTE = "/dashboard";
const DEFAULT_PUBLIC_ROUTE = "/";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  const { productConfig } = useConfig();
  const pathname = usePathname();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  // Get routes from config or use defaults
  const publicRoutes = productConfig?.routes?.public || PUBLIC_ROUTES;
  const authenticatedRoute = productConfig?.routes?.authenticated || '/dashboard';
  const publicRoute = productConfig?.routes?.public?.[0] || DEFAULT_PUBLIC_ROUTE;

  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = publicRoutes.includes(pathname);
    
    // Add debugging
    console.log("RouteGuard state:", { 
      isLoggedIn, 
      pathname, 
      isPublicRoute,
      publicRoutes
    });

    try {
      if (isLoggedIn && pathname === publicRoute) {
        // If logged in and on the landing page, redirect to dashboard
        console.log("Redirecting to dashboard");
        router.replace(authenticatedRoute);
      } else if (!isLoggedIn && !isPublicRoute) {
        // If not logged in and trying to access a protected route
        console.log("Not logged in, redirecting to landing page");
        router.replace(publicRoute);
      } else {
        // Either logged in and not on landing page, or not logged in but on a public route
        console.log("No redirect needed, showing content");
        setIsReady(true);
      }
    } catch (error) {
      console.error("Navigation error:", error);
      // If there's an error, still show the content
      setIsReady(true);
    }
  }, [isLoggedIn, isLoading, pathname, router, publicRoutes, authenticatedRoute, publicRoute]);

  if (!isReady) return <LoadingSkeleton />;

  return <>{children}</>;
}
