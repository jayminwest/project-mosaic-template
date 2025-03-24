"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { RouteGuard } from "@/components/RouteGuard";
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
        className={`${inter.className} bg-gradient-to-br from-primary to-secondary min-h-screen`}
        style={{
          fontFamily: theme?.fonts?.body || 'Inter, sans-serif',
        }}
      >
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Card className="w-full max-w-2xl mx-auto">
              <CardContent className="p-6">
                <RouteGuard>{children}</RouteGuard>
              </CardContent>
            </Card>
          </main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
