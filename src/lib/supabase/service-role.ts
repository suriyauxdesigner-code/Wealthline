import { createClient } from "@supabase/supabase-js";

// Bypasses RLS entirely — only for trusted server-side contexts with no
// user session to authenticate as (e.g. the daily exchange-rate cron).
// Never import this into client code. Requires SUPABASE_SERVICE_ROLE_KEY.
export function createServiceRoleClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
