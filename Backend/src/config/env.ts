// Backend/src/config/env.ts
import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8000),
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(16),
  CORS_ORIGIN: z.url().default("http://localhost:3000"),
});

export const env = envSchema.parse(process.env);
