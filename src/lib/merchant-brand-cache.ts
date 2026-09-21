// Local cache of merchant name -> resolved Brandfetch brand, so a merchant
// the user has already picked a logo for resolves instantly next time
// (no network call) and survives across the app (any screen showing that
// merchant's icon looks it up here first). Keyed by normalized merchant name.
import type { BrandSearchResult } from "./brandfetch";

const STORAGE_KEY = "wealthline:merchant-brands";
const MAX_ENTRIES = 300;

function normalize(name: string): string {
  return name.trim().toLowerCase();
}

function readAll(): Record<string, BrandSearchResult> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(entries: Record<string, BrandSearchResult>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage full or unavailable (private browsing) — the cache is a pure
    // speed/convenience optimization, safe to silently skip persisting.
  }
}

export function getCachedBrand(merchant: string): BrandSearchResult | null {
  if (!merchant.trim()) return null;
  return readAll()[normalize(merchant)] ?? null;
}

export function setCachedBrand(merchant: string, brand: BrandSearchResult) {
  if (!merchant.trim()) return;
  const entries = readAll();
  entries[normalize(merchant)] = brand;
  const keys = Object.keys(entries);
  if (keys.length > MAX_ENTRIES) {
    // Oldest-first insertion order from JSON object key enumeration — drop the front.
    for (const k of keys.slice(0, keys.length - MAX_ENTRIES)) delete entries[k];
  }
  writeAll(entries);
}

/** All cached merchant names (lowercased) whose brand name/domain matches `query`. */
export function searchCachedBrands(query: string): BrandSearchResult[] {
  const q = normalize(query);
  if (!q) return [];
  const entries = Object.values(readAll());
  return entries.filter((b) => b.name.toLowerCase().includes(q) || b.domain.toLowerCase().includes(q));
}
