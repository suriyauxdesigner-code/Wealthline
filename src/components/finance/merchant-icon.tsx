"use client";

import * as React from "react";

import { getBrandLogoUrl } from "@/lib/brandfetch";
import { getCachedBrand } from "@/lib/merchant-brand-cache";
import { resolveMerchantIcon } from "@/lib/merchant-icons";
import { resolveIcon } from "./icon-map";

interface BrandLogoProps {
  domain: string | null;
  fallback: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// Renders the real Brandfetch logo for `domain` (not the low-res lettermark
// placeholder the Search API's own `icon` field returns — that one's only
// meant for a quick "is this the brand I meant" glance, not actual display).
// Falls through to `fallback` when there's no domain, or the image 404s/
// fails to load (offline, Brandfetch not configured, or no logo on file).
export function BrandLogo({ domain, fallback, className, style }: BrandLogoProps) {
  // Tracks *which* url last failed, rather than a plain boolean, so a
  // changed `domain` prop automatically gets a fresh attempt without an
  // effect to reset the flag — comparing against the current url is enough.
  const [failedUrl, setFailedUrl] = React.useState<string | null>(null);
  const url = domain ? getBrandLogoUrl(domain) : null;

  if (url && url !== failedUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- external, arbitrary-domain brand logos; next/image's domain allowlist doesn't fit a growing merchant list.
    return <img src={url} alt="" className={className} style={style} onError={() => setFailedUrl(url)} />;
  }
  return fallback;
}

interface MerchantIconProps {
  merchant: string;
  categoryIcon: string;
  className?: string;
  style?: React.CSSProperties;
  strokeWidth?: number;
}

// Resolves a transaction's icon in priority order: a Brandfetch logo the
// user has previously matched to this exact merchant (cached locally when
// they picked it from the merchant autocomplete), then a Simple Icons brand
// match, then the existing category icon as fallback — used everywhere a
// transaction's merchant is shown, so every call site stays in sync as the
// merchant database grows. The cache lookup is deferred to a mount effect
// (it reads localStorage) so server and first-paint client markup match.
export function MerchantIcon({ merchant, categoryIcon, className, style, strokeWidth }: MerchantIconProps) {
  const [cachedDomain, setCachedDomain] = React.useState<string | null>(null);

  React.useEffect(() => {
    setCachedDomain(getCachedBrand(merchant)?.domain ?? null);
  }, [merchant]);

  const brand = resolveMerchantIcon(merchant);
  const fallback = brand ? (
    <svg role="img" viewBox="0 0 24 24" className={className} style={{ ...style, color: `#${brand.hex}` }} fill="currentColor">
      <title>{brand.title}</title>
      <path d={brand.path} />
    </svg>
  ) : (
    React.createElement(resolveIcon(categoryIcon), { className, style, strokeWidth })
  );

  return <BrandLogo domain={cachedDomain} fallback={fallback} className={className} style={style} />;
}
