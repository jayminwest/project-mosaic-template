"use client";

import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background w-full">
      <div className="container px-4 py-8 md:px-6 md:py-12 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Project Mosaic</h3>
            <p className="text-sm text-muted-foreground">
              A powerful framework for building micro-SaaS products quickly and efficiently.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                  Help
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/legal" className="text-muted-foreground hover:text-foreground transition-colors">
                  Legal Information
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Project Mosaic. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
