import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <title>Project Mosaic - Build Micro-SaaS Products Faster</title>
        <meta name="description" content="A powerful framework for building micro-SaaS products quickly and efficiently. Launch your next product in days, not months." />
      </head>
      <body className={`${inter.className} min-h-screen bg-background`}>
        <div className="flex flex-col min-h-screen">
          <Header />
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
