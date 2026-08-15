'use client';

import { NeonAuthUIProvider } from '@neondatabase/neon-js/auth/react/ui';
import { neon } from '@/lib/neon';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <NeonAuthUIProvider emailOTP authClient={neon.auth as unknown as Parameters<typeof NeonAuthUIProvider>[0]['authClient']}>
      {children}
    </NeonAuthUIProvider>
  );
}