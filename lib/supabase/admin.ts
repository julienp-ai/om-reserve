import { createClient } from '@supabase/supabase-js'

// Client with service role key — bypasses RLS.
// Use ONLY in server-side actions, never expose to the client.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}
