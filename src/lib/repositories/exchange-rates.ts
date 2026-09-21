import { createClient } from "@/lib/supabase/client";

// A little over a day of slack past the daily cron tick, so an on-time cron
// run never looks stale to a client checking right before the next one.
const STALE_MS = 26 * 60 * 60 * 1000;

const FRANKFURTER_URL = "https://api.frankfurter.dev/v1/latest?base=USD&symbols=INR";

/**
 * The shared USD→INR rate, read from the table the daily cron keeps fresh
 * (see src/app/api/cron/exchange-rate). Opportunistically refreshes it
 * itself if the cached row is missing or looks stale — a fallback for the
 * (rare) case the cron hasn't run yet, e.g. right after the migration.
 */
export async function getUsdInrRate(): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("exchange_rates")
    .select("rate, updated_at")
    .eq("pair", "USDINR")
    .maybeSingle();

  if (error || !data) return refreshUsdInrRate();

  const isStale = Date.now() - new Date(data.updated_at).getTime() > STALE_MS;
  return isStale ? refreshUsdInrRate() : data.rate;
}

async function refreshUsdInrRate(): Promise<number> {
  try {
    const res = await fetch(FRANKFURTER_URL, { signal: AbortSignal.timeout(6000) });
    const data = await res.json();
    const rate = data?.rates?.INR;
    if (typeof rate !== "number" || rate <= 0) throw new Error("Unexpected FX response shape");

    const supabase = createClient();
    await supabase.from("exchange_rates").upsert({ pair: "USDINR", rate, updated_at: new Date().toISOString() });
    return rate;
  } catch {
    // Last resort if both the cached row and a fresh fetch are unavailable
    // (e.g. offline) — a rough ballpark beats blocking the whole app.
    return 83;
  }
}
