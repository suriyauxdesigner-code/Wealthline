import { NextResponse } from "next/server";

// Proxies Brandfetch's Brand Search API (https://api.brandfetch.io/v2/search/:name)
// server-side — avoids any browser CORS uncertainty and keeps the client ID
// out of a raw third-party fetch URL in the client bundle. Returns an empty
// array (never an error status) whenever the feature isn't configured or the
// upstream call fails, so callers can treat "no results" as the only case to
// handle and fall back to local/Simple Icons matching unconditionally.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const clientId = process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID;

  if (!query || !clientId) {
    return NextResponse.json([]);
  }

  try {
    const res = await fetch(`https://api.brandfetch.io/v2/search/${encodeURIComponent(query)}?c=${clientId}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return NextResponse.json([]);

    const data = await res.json();
    if (!Array.isArray(data)) return NextResponse.json([]);

    const results = data
      .filter((r): r is { name: string; domain: string; icon?: string } => typeof r?.name === "string" && typeof r?.domain === "string")
      .slice(0, 8)
      .map((r) => ({ name: r.name, domain: r.domain, icon: r.icon ?? null }));

    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}
