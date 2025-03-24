# Project Mosaic: SaaS Template

This is the foundation template for Project Mosaic - a framework designed for rapidly developing multiple micro-SaaS products. The template provides a complete frontend with styling and core infrastructure, ready to be customized for different product types.

## Getting Started

To use this template, you'll need:
- NodeJS and NPM installed
- Familiarity with TypeScript and Next.js
- Basic understanding of Supabase (auth, database, storage)

Install the dependencies:

```sh
npm install
```

Run the project in development mode:

```sh
npm run dev
```

You can now access the app at http://localhost:3000. The UI is fully implemented, but you'll need to connect it to Supabase and implement the specific product functionality.

## Project Structure

```sh
project-mosaic-template
├── ai_docs        # AI-optimized documentation
├── app            # Next.js app router pages
├── components     # UI Components
├── hooks          # Core service hooks
├── lib            # Utilities and data models
├── supabase       # Supabase configuration and functions
├── tests          # Test suites
├── tutorial       # Implementation guides
└── types          # TypeScript interfaces
```

The template is designed to be AI-friendly, with clear separation of concerns and consistent patterns throughout the codebase.

## Core Technologies

- **Frontend**: Next.js with React and Tailwind CSS
- **UI Components**: shadcn/ui component library
- **Backend/Database**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel
- **Payments**: Stripe
- **Testing**: Jest

## Customization Points

The primary customization points are in the `/hooks` folder:
- `useAuth.ts` - Authentication logic
- `useSubscription.ts` - Subscription management
- `useProductService.ts` - Product-specific functionality (to be implemented)

Follow the tutorials to implement your specific product functionality while leveraging the shared infrastructure.
