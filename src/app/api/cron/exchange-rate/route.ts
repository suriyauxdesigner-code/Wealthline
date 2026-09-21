import { NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/supabase/service-role";

// Vercel Cron hits this once a day (see vercel.json) to refresh the
// USD→INR rate every foreign-currency investment converts against.
// Frankfurter (frankfurter.dev) is a free, keyless FX API backed by the
// ECB's daily reference rates — no signup needed for this part.
//
// Verify the request actually came from Vercel Cron (or someone who knows
// CRON_SECRET) before writing anything — this route has no other auth.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch("https://api.frankfurter.dev/v1/latest?base=USD&symbols=INR", {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return NextResponse.json({ error: "FX API unavailable" }, { status: 502 });

    const data = await res.json();
    const rate = data?.rates?.INR;
    if (typeof rate !== "number" || rate <= 0) {
      return NextResponse.json({ error: "Unexpected FX response shape" }, { status: 502 });
    }

    const supabase = createServiceRoleClient();
    const { error } = await supabase
      .from("exchange_rates")
      .upsert({ pair: "USDINR", rate, updated_at: new Date().toISOString() });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ pair: "USDINR", rate });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
