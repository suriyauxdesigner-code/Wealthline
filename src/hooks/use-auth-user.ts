"use client";

import * as React from "react";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";

export function useAuthUser(): User | null {
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  return user;
}

export function displayName(user: User | null): string {
  if (!user) return "Account";
  return (user.user_metadata?.name as string | undefined) || user.email || "Account";
}
