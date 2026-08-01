import { SupabaseClient } from '@supabase/supabase-js';

// Safe proxy placeholder to prevent Prisma initialization crashes
// while maintaining compatibility across legacy imports
export const prisma = new Proxy(
  {},
  {
    get(_target, prop) {
      if (prop === '$disconnect') return async () => {};
      return new Proxy(
        {},
        {
          get() {
            return async () => {
              throw new Error(
                'Prisma execution blocked: App migrated to Supabase HTTPS REST. Use @/lib/supabase.'
              );
            };
          },
        }
      );
    },
  }
) as any;