"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { useConfig } from "@/lib/config/useConfig";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useConfig();
  
  return (
    <html lang="en">
      <body
        className={`${inter.className} min-h-screen bg-background`}
        style={{
          fontFamily: theme?.fonts?.body || 'Inter, sans-serif',
        }}
      >
        <div className="flex flex-col min-h-screen">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
