import * as React from "react";

import { resolveMerchantIcon } from "@/lib/merchant-icons";
import { resolveIcon } from "./icon-map";

interface MerchantIconProps {
  merchant: string;
  categoryIcon: string;
  className?: string;
  style?: React.CSSProperties;
  strokeWidth?: number;
}

// Resolves a transaction's icon in priority order: a matched brand logo
// (Simple Icons, rendered in its own brand color) first, then the existing
// category icon as fallback — used everywhere a transaction's merchant is
// shown, so every call site stays in sync as the merchant database grows.
export function MerchantIcon({ merchant, categoryIcon, className, style, strokeWidth }: MerchantIconProps) {
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
