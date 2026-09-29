import { z } from 'zod';

const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z.url('EXPO_PUBLIC_API_URL'),
  EXPO_PUBLIC_API_OAUTH_URL: z.url('EXPO_PUBLIC_API_OAUTH_URL'),
  EXPO_PUBLIC_APP_NAME: z.string('EXPO_PUBLIC_APP_NAME').min(1).default('MeghEis'),

  EXPO_PUBLIC_APP_SK: z.string('EXPO_PUBLIC_APP_SK').min(1),
  EXPO_PUBLIC_APP_IV: z.string('EXPO_PUBLIC_APP_IV').min(1),
  EXPO_PUBLIC_APP_ID: z.string().min(1),
  EXPO_PUBLIC_BASIC_AUTH: z.string('EXPO_PUBLIC_BASIC_AUTH').min(1),
  NODE_ENV: z.enum(['development', 'preview', 'production']).default('development'),

  // App Config
  EXPO_PUBLIC_APP_VERSION: z
    .string('EXPO_PUBLIC_APP_VERSION')
    .regex(/^\d+\.\d+\.\d+$/, 'Must be a valid semantic version, e.g. 1.0.0')
    .default('1.0.0'),

  EXPO_PUBLIC_HTTP_PROVIDER: z.string('EXPO_PUBLIC_HTTP_PROVIDER').min(1).default('re'),

  EXPO_PUBLIC_APP_VARIANT: z.enum(['development', 'preview', 'production']).default('development'),
});

const rawEnv = {
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_API_OAUTH_URL: process.env.EXPO_PUBLIC_API_OAUTH_URL,
  EXPO_PUBLIC_APP_NAME: process.env.EXPO_PUBLIC_APP_NAME,

  EXPO_PUBLIC_APP_SK: process.env.EXPO_PUBLIC_APP_SK,
  EXPO_PUBLIC_APP_IV: process.env.EXPO_PUBLIC_APP_IV,
  EXPO_PUBLIC_APP_ID: process.env.EXPO_PUBLIC_APP_ID,
  EXPO_PUBLIC_BASIC_AUTH: process.env.EXPO_PUBLIC_BASIC_AUTH,

  EXPO_PUBLIC_APP_VERSION: process.env.EXPO_PUBLIC_APP_VERSION,
  EXPO_PUBLIC_HTTP_PROVIDER: process.env.EXPO_PUBLIC_HTTP_PROVIDER,
  EXPO_PUBLIC_APP_VARIANT: process.env.EXPO_PUBLIC_APP_VARIANT,
  NODE_ENV: process.env.NODE_ENV,
};

const result = envSchema.safeParse(rawEnv);

if (!result.success) {
  console.error('❌ Invalid environment variables:');

  for (const issue of result.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  }

  throw new Error('Invalid environment variables');
}

export const env = result.data;
