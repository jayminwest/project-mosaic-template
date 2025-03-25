"use client";

export default function SimplePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 border-b">
        <h1 className="text-xl font-bold">Project Mosaic</h1>
      </header>
      
      <main className="flex-1 p-4">
        <h2 className="text-2xl font-bold">Welcome to Project Mosaic</h2>
        <p className="mt-2">A powerful micro-SaaS template for building profitable products quickly.</p>
      </main>
      
      <footer className="p-4 border-t">
        <p>© 2023 Project Mosaic</p>
      </footer>
    </div>
  );
}
