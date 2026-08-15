'use client';

import { NeonAuthUIProvider } from '@neondatabase/neon-js/auth/react/ui';
import { neon } from '@/lib/neon';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <NeonAuthUIProvider emailOTP authClient={neon.auth as any}>
      {children}
    </NeonAuthUIProvider>
  );
}
