import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check .env.local');
}

// Next.js patches the global fetch to cache responses by default in Server
// Components/Route Handlers. Route segment `dynamic = "force-dynamic"` is
// supposed to disable this, but in practice reads made through the Supabase
// client have been observed to still serve a stale cached response on
// Vercel - explicitly forcing no-store here removes any ambiguity.
const noStoreFetch: typeof fetch = (input, init) => fetch(input, { ...init, cache: 'no-store' });

// Public client - respects RLS
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: noStoreFetch },
});

// Admin client - bypasses RLS (use only for admin operations)
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, { global: { fetch: noStoreFetch } })
  : supabase;
