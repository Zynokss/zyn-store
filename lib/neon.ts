import { createClient } from '@neondatabase/neon-js';
import { BetterAuthReactAdapter } from '@neondatabase/neon-js/auth/react/adapters';

const REMOTE_NEON_AUTH_URL =
  process.env.NEXT_PUBLIC_NEON_AUTH_URL ||
  process.env.NEON_AUTH_BASE_URL ||
  'https://ep-small-wave-b1l95pmw.neonauth.c-5.eu-central-1.aws.neon.tech/neondb/auth';

const REMOTE_NEON_DATAAPI_URL =
  process.env.NEXT_PUBLIC_NEON_DATAAPI_URL ||
  process.env.NEON_DATAAPI_BASE_URL ||
  'https://ep-small-wave-b1l95pmw.apirest.c-5.eu-central-1.aws.neon.tech/neondb/rest/v1';

const isServerRuntime =
  typeof globalThis !== 'undefined' &&
  typeof (globalThis as any).process !== 'undefined' &&
  !!(globalThis as any).process?.versions?.node;

const isBrowser = !isServerRuntime && typeof window !== 'undefined';

const getBrowserOrigin = (): string => {
  if (typeof window !== 'undefined') {
    try {
      return new URL(window.location.href).origin;
    } catch {
      /* noop */
    }
  }
  return 'http://localhost:3000';
};

const authUrl = isBrowser
  ? `${getBrowserOrigin()}/api/auth`
  : REMOTE_NEON_AUTH_URL;

const dataApiUrl = isBrowser
  ? `${getBrowserOrigin()}/api/auth/_data_api_fallback`
  : REMOTE_NEON_DATAAPI_URL;

const adapter = BetterAuthReactAdapter();

export const neon = createClient({
  auth: {
    url: authUrl,
    adapter,
  },
  dataApi: {
    url: dataApiUrl,
  },
} as any) as any;

export { BetterAuthReactAdapter };
export type NeonClient = typeof neon;
