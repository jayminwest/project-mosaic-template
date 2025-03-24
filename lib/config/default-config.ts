import { ProductConfig } from './types';

export const productConfig: ProductConfig = {
  name: "Project Mosaic",
  description: "A flexible micro-SaaS template for rapid development",
  slug: "project-mosaic", // Used in URLs and as prefix for storage
  limits: {
    free: {
      resourceLimit: 10,
      storageLimit: 5, // MB
    },
    premium: {
      resourceLimit: 100,
      storageLimit: 50, // MB
    }
  },
  features: {
    enableAI: true,
    enableStorage: true,
    enableSharing: false,
    enableAnalytics: false,
    enableMarketing: true
  },
  routes: {
    public: ["/", "/login", "/pricing", "/about", "/contact"],
    authenticated: "/dashboard"
  },
  storage: {
    bucketName: "app-storage"
  }
};
