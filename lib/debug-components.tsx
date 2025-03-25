"use client";

import { useEffect } from 'react';

export function DebugComponentRender({ componentName }: { componentName: string }) {
  useEffect(() => {
    console.log(`Component rendered: ${componentName}`);
    
    // Log additional debugging information
    console.log('React version:', React.version);
    console.log('Current component:', componentName);
    console.log('Window object available:', typeof window !== 'undefined');
    
    // Check for any undefined props or components
    try {
      const parentElement = document.currentScript?.parentElement;
      if (parentElement) {
        console.log('Parent element:', parentElement.tagName);
      }
    } catch (e) {
      console.log('Error checking parent element:', e);
    }
  }, [componentName]);
  
  return null;
}
