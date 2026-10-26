// ============================================================
// Wristloom — Environment Variable Schema & Runtime Validator
// Layer 9: Hosting & Cloud (15-Layer SaaS Playbook, p. 20)
// Fails loudly at startup if required variables are missing or malformed.
// ============================================================

import { z } from 'zod';

const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // NextAuth v5
  AUTH_SECRET: z.string().min(16, 'AUTH_SECRET must be at least 16 characters for cryptographic safety'),
  AUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().optional(),

  // Google OAuth (Optional in dev, required in production if OAuth enabled)
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),

  // Database Connection (Supabase PostgreSQL)
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required to connect to PostgreSQL'),
  DIRECT_URL: z.string().optional(),

  // Payments Gateway (Razorpay)
  RAZORPAY_KEY_ID: z.string().min(1, 'RAZORPAY_KEY_ID is required for payments'),
  RAZORPAY_KEY_SECRET: z.string().min(1, 'RAZORPAY_KEY_SECRET is required for payment verification'),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  ALLOW_SIMULATED_PAYMENTS: z.enum(['true', 'false']).default('false'),

  // Public Environment Variables
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),

  // Server Keys
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  GOOGLE_MAPS_SERVER_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('Wristloom <concierge@wristloom.luxury>'),
  ADMIN_EMAILS: z.string().default('wristloom@gmail.com'),
});

export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

export function validateEnv(): { valid: boolean; env?: Env; errors?: string[] } {
  if (validatedEnv) {
    return { valid: true, env: validatedEnv };
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errorMessages = result.error.errors.map((err) => {
      const path = err.path.join('.');
      return `  ❌ [ENV ERROR] ${path}: ${err.message}`;
    });

    return {
      valid: false,
      errors: errorMessages,
    };
  }

  validatedEnv = result.data;
  return { valid: true, env: validatedEnv };
}

export function getValidatedEnv(): Env {
  const { valid, env, errors } = validateEnv();
  if (!valid || !env) {
    const msg = [
      'CRITICAL: Environment configuration validation failed!',
      ...(errors || []),
      'Please check your .env.local file or platform environment variables.',
    ].join('\n');
    throw new Error(msg);
  }
  return env;
}
