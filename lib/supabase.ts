import { createClient, SupabaseClient } from '@supabase/supabase-js';

const globalForSupabase = globalThis as unknown as {
  supabaseInstance?: SupabaseClient;
};

export function getSupabase(): SupabaseClient {
  if (globalForSupabase.supabaseInstance) {
    return globalForSupabase.supabaseInstance;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'placeholder-key';

  const client = createClient(url, key);

  // Cache on globalThis in development to prevent duplicate instances during HMR
  if (process.env.NODE_ENV !== 'production') {
    globalForSupabase.supabaseInstance = client;
  }

  return client;
}

// Proxy export maintains backward compatibility (e.g., supabase.from(...))
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop: keyof SupabaseClient) {
    const client = getSupabase();
    const value = client[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});