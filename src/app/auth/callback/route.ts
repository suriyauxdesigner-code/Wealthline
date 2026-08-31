import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

// Handles both the OAuth (Google) redirect and the email-link redirect
// (signup confirmation, password reset) — both arrive here with a `code`
// query param to exchange for a session.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (next) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      const userId = data.user?.id;
      const { data: profile } = userId
        ? await supabase.from("profiles").select("id").eq("user_id", userId).maybeSingle()
        : { data: null };

      return NextResponse.redirect(`${origin}${profile ? "/overview" : "/onboarding"}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
