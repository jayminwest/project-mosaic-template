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
  const authenticatedRoute = productConfig?.routes?.authenticated || DEFAULT_AUTHENTICATED_ROUTE;
  const publicRoute = productConfig?.routes?.public?.[0] || DEFAULT_PUBLIC_ROUTE;

  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = publicRoutes.includes(pathname);

    if (isLoggedIn && pathname === publicRoute) {
      router.replace(authenticatedRoute);
    } else if (!isLoggedIn && !isPublicRoute) {
      router.replace(publicRoute);
    } else {
      setIsReady(true);
    }
  }, [isLoggedIn, isLoading, pathname, router, publicRoutes, authenticatedRoute, publicRoute]);

  if (!isReady) return <LoadingSkeleton />;

  return <>{children}</>;
}
