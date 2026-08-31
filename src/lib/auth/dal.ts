import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

// Server-side Data Access Layer — call this from Server Components, Server
// Actions, and Route Handlers rather than trusting proxy.ts alone. Row Level
// Security is the actual enforcement; this just gets the current user without
// a redundant Supabase round trip per render.
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
