import { createNeonAuth } from '@neondatabase/neon-js/auth/next/server';

const baseUrl = process.env.NEXT_PUBLIC_NEON_AUTH_URL || process.env.NEON_AUTH_BASE_URL;

if (!baseUrl) {
  console.warn(
    '[neon-auth] NEXT_PUBLIC_NEON_AUTH_URL not found in env. ' +
      'Add NEXT_PUBLIC_NEON_AUTH_URL=<your neon auth URL> to .env.local'
  );
}

const cookieSecret =
  process.env.NEON_AUTH_COOKIE_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  'zyn-store-neon-auth-cookie-secret-min-32-chars-long-and-secure-please-change-me-1234567890ABCDEF';

export const auth = createNeonAuth({
  baseUrl: baseUrl || 'https://example.neonauth.aws.neon.tech/db/auth',
  cookies: {
    secret: cookieSecret,
    sessionDataTtl: 300,
  },
  logLevel: 'warn',
});

export type { NeonAuth } from '@neondatabase/neon-js/auth/next/server';
