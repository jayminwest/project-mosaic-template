import { Database } from "@/lib/database.types";

// Database Models
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type UsageTracking = Database["public"]["Tables"]["usage_tracking"]["Row"];

// Extended User type that includes additional fields not in the database
export type User = Profile & {
  email: string;
  usage_metrics?: {
    [key: string]: number;
  };
};
