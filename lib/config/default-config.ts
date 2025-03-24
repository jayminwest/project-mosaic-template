import { ProductConfig } from './types.js';

export const productConfig: ProductConfig = {
  name: "Your Product Name",
  description: "A brief description of your product",
  slug: "your-product", // Used in URLs and as prefix for storage
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
  }
};
