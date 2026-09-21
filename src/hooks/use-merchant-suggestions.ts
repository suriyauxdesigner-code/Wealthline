"use client";

import * as React from "react";

import { searchBrands, type BrandSearchResult } from "@/lib/brandfetch";
import { searchCachedBrands } from "@/lib/merchant-brand-cache";

export interface MerchantSuggestion {
  name: string;
  domain: string | null;
  icon: string | null;
  source: "history" | "remote";
}

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

/**
 * Reusable merchant-suggestion source for any free-text merchant field:
 * local matches (the user's own past merchant names + previously resolved
 * brands, from `pastMerchantNames`/localStorage — instant, no network)
 * appear immediately, then a debounced Brandfetch Brand Search result set
 * is appended once it resolves. Callers own the actual input value; this
 * hook only turns a query string into a suggestion list.
 */
export function useMerchantSuggestions(query: string, pastMerchantNames: string[]) {
  const [remote, setRemote] = React.useState<BrandSearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);

  const local = React.useMemo<MerchantSuggestion[]>(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    const seen = new Set<string>();
    const results: MerchantSuggestion[] = [];

    const cached = searchCachedBrands(trimmed);
    for (const b of cached) {
      const key = b.domain || b.name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      results.push({ name: b.name, domain: b.domain, icon: b.icon, source: "history" });
    }

    const distinctPast = Array.from(new Set(pastMerchantNames.map((m) => m.trim()).filter(Boolean)));
    for (const name of distinctPast) {
      if (!name.toLowerCase().includes(trimmed)) continue;
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      results.push({ name, domain: null, icon: null, source: "history" });
    }

    return results.slice(0, 8);
  }, [query, pastMerchantNames]);

  React.useEffect(() => {
    const trimmed = query.trim();
    // Below the minimum length there's nothing to fetch — leave `remote` as
    // is; the suggestions memo below ignores it until the query is long
    // enough again, so no state update is needed here.
    if (trimmed.length < MIN_QUERY_LENGTH) return;

    let cancelled = false;
    setLoading(true);
    const searchTimer = setTimeout(async () => {
      const results = await searchBrands(trimmed);
      if (!cancelled) {
        setRemote(results);
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(searchTimer);
    };
  }, [query]);

  const suggestions = React.useMemo<MerchantSuggestion[]>(() => {
    const seen = new Set(local.map((s) => (s.domain ?? s.name.toLowerCase())));
    const remoteSuggestions: MerchantSuggestion[] =
      query.trim().length >= MIN_QUERY_LENGTH
        ? remote.filter((b) => !seen.has(b.domain)).map((b) => ({ name: b.name, domain: b.domain, icon: b.icon, source: "remote" as const }))
        : [];
    return [...local, ...remoteSuggestions].slice(0, 10);
  }, [local, remote, query]);

  return { suggestions, loading: loading && query.trim().length >= MIN_QUERY_LENGTH };
}
