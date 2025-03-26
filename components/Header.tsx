"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useConfig } from "@/lib/config/useConfig";
import { useRouter } from "next/navigation";

export function Header() {
  const { productConfig } = useConfig();
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">{productConfig?.name || "Project Mosaic"}</span>
          </Link>
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="w-6 h-6"
          >
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/pricing" className="text-sm font-medium hover:underline">
            Pricing
          </Link>
          <Link href="/help" className="text-sm font-medium hover:underline">
            Help
          </Link>
          
          {!isLoading && (
            <>
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">Dashboard</Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="outline" size="sm">Profile</Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" size="sm">Log In</Button>
                  </Link>
                  <Link href="/login">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
        
        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-background border-b md:hidden p-4 flex flex-col space-y-4">
            <Link href="/pricing" className="text-sm font-medium hover:underline">
              Pricing
            </Link>
            <Link href="/help" className="text-sm font-medium hover:underline">
              Help
            </Link>
            
            {!isLoading && (
              <>
                {user ? (
                  <>
                    <Link href="/dashboard">
                      <Button variant="outline" size="sm" className="w-full">Dashboard</Button>
                    </Link>
                    <Link href="/profile">
                      <Button variant="outline" size="sm" className="w-full">Profile</Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full">
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="outline" size="sm" className="w-full">Log In</Button>
                    </Link>
                    <Link href="/signup">
                      <Button size="sm" className="w-full">Sign Up</Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

