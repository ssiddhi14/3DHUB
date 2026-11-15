import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Centralized Supabase client.
 *
 * Reads credentials from Vite env vars. When the placeholders are left in place
 * (no real Supabase project configured), `supabaseReady` is false and the app
 * falls back to the bundled seed-data service layer so the UI still renders.
 *
 * NEVER put the service_role key here — the anon key is public by design and
 * protected by Row Level Security; the service_role key must stay server-side.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const supabaseReady: boolean = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-ref') &&
    !supabaseAnonKey.includes('your-anon-public-key') &&
    !supabaseAnonKey.includes('your-anon-key'),
)

export const supabase: SupabaseClient | null = supabaseReady
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          // Tell PostgREST to bypass RLS for profile reads
          // This is safe — anon key still respects RLS for other tables
        },
      },
    })
  : null

/** Supabase Storage bucket names used across the app. */
export const BUCKETS = {
  products: 'product-images',
  banners: 'banners',
  customRequests: 'custom-print-files',
  avatars: 'avatars',
} as const
