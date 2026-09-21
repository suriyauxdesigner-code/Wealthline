"use client";

import * as React from "react";

import { getBrandLogoUrl } from "@/lib/brandfetch";
import { getCachedBrand } from "@/lib/merchant-brand-cache";
import { resolveMerchantIcon } from "@/lib/merchant-icons";
import { resolveIcon } from "./icon-map";

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
// merchant database grows. The Brandfetch lookup is deferred to a mount
// effect (it reads localStorage) so server and first-paint client markup
// match; a failed image load (e.g. offline, or Brandfetch not configured)
// falls through the same chain via onError.
export function MerchantIcon({ merchant, categoryIcon, className, style, strokeWidth }: MerchantIconProps) {
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
  const [imgFailed, setImgFailed] = React.useState(false);

  React.useEffect(() => {
    const cached = getCachedBrand(merchant);
    setLogoUrl(cached ? getBrandLogoUrl(cached.domain) : null);
    setImgFailed(false);
  }, [merchant]);

  if (logoUrl && !imgFailed) {
    // eslint-disable-next-line @next/next/no-img-element -- external, arbitrary-domain brand logos; next/image's domain allowlist doesn't fit a growing merchant list.
    return <img src={logoUrl} alt="" className={className} style={style} onError={() => setImgFailed(true)} />;
  }

  const brand = resolveMerchantIcon(merchant);
  if (brand) {
    return (
      <svg role="img" viewBox="0 0 24 24" className={className} style={{ ...style, color: `#${brand.hex}` }} fill="currentColor">
        <title>{brand.title}</title>
        <path d={brand.path} />
      </svg>
    );
  }
  return React.createElement(resolveIcon(categoryIcon), { className, style, strokeWidth });
}
