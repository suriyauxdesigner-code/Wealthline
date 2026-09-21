// Client-side Brandfetch helpers (https://brandfetch.com).
//
// Requires NEXT_PUBLIC_BRANDFETCH_CLIENT_ID to be set (a free Brandfetch
// "Client ID", not a secret key — Brandfetch's own docs embed it directly in
// <img> tags, so it's safe to expose to the browser). Every function here
// degrades to "no result" when that env var is unset, so the rest of the app
// (Simple Icons / initials / category icon) keeps working unconfigured.
export interface BrandSearchResult {
  name: string;
  domain: string;
  icon: string | null;
}

const CLIENT_ID = process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID;

export function brandfetchEnabled(): boolean {
  return !!CLIENT_ID;
}

/** Square brand mark for `domain`, sized for inline use (e.g. a 24–40px icon slot). Null if unconfigured. */
export function getBrandLogoUrl(domain: string, size = 64): string | null {
  if (!CLIENT_ID) return null;
  return `https://cdn.brandfetch.io/domain/${encodeURIComponent(domain)}/w/${size}/h/${size}/type/icon/fallback/404?c=${CLIENT_ID}`;
}

/** Debounce this at the call site — each call hits our own /api/brandfetch/search proxy. */
export async function searchBrands(query: string): Promise<BrandSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  try {
    const res = await fetch(`/api/brandfetch/search?q=${encodeURIComponent(trimmed)}`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
