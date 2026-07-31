import { createClient } from '@supabase/supabase-js';

const rawUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://ujfxkybkhqdpdjigkqei.supabase.co';

// Strip any trailing spaces, quotes, or whitespace
const supabaseUrl = rawUrl.replace(/["']/g, '').trim();

const supabaseAnonKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_t9b4bZCrElb8trjHmfFdkQ_fjDWOi0l'
).replace(/["']/g, '').trim();

export const supabase = createClient(
  supabaseUrl.startsWith('http') ? supabaseUrl : `https://${supabaseUrl}`,
  supabaseAnonKey
);