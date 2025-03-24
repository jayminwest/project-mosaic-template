"use client";

import LoginForm from "@/components/LoginForm";
import { useConfig } from "@/lib/config/useConfig";

export default function Home() {
  const { productConfig } = useConfig();
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center">
        {productConfig?.name || "Project Mosaic"}
      </h1>
      <p className="text-center text-muted-foreground">
        {productConfig?.description || "A micro-SaaS template for rapid development"}
      </p>
      <LoginForm />
    </div>
  );
}
