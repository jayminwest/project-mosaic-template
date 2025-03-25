"use client";

import { useEffect } from 'react';

export function DebugComponentRender({ componentName }: { componentName: string }) {
  useEffect(() => {
    console.log(`Component rendered: ${componentName}`);
  }, [componentName]);
  
  return null;
}
