"use client";

import * as React from "react";
import { Banknote, CreditCard, Landmark, LineChart, PiggyBank } from "lucide-react";

import { BrandLogo } from "./merchant-icon";
import { getCachedBrand } from "@/lib/merchant-brand-cache";
import { resolveMerchantIcon } from "@/lib/merchant-icons";
import type { AccountGroup } from "@/lib/types";

export const ACCOUNT_GROUP_ICON: Record<AccountGroup, typeof Banknote> = {
  cash: Banknote,
  bank: Landmark,
  credit: CreditCard,
  investment: LineChart,
  other: PiggyBank,
};

interface AccountIconProps {
  name: string;
  institution?: string;
  group: AccountGroup;
  className?: string;
  style?: React.CSSProperties;
  strokeWidth?: number;
}

// Same priority order as MerchantIcon, applied to accounts: a Brandfetch
// logo the user has matched to this institution (cached when they picked it
// from the Institution field's search), then a Simple Icons brand match,
// then the account group's own icon (bank/credit card/etc.) as fallback.
// Matches on the institution name first (e.g. "State Bank of India") since
// that's the actual brand, falling back to the account's own label (e.g.
// "Groww") when institution isn't set.
export function AccountIcon({ name, institution, group, className, style, strokeWidth }: AccountIconProps) {
  const matchName = institution?.trim() || name;
  const [cachedDomain, setCachedDomain] = React.useState<string | null>(null);

  React.useEffect(() => {
    setCachedDomain(getCachedBrand(matchName)?.domain ?? null);
  }, [matchName]);

  const brand = resolveMerchantIcon(matchName);
  const GroupIcon = ACCOUNT_GROUP_ICON[group];
  const fallback = brand ? (
    <svg role="img" viewBox="0 0 24 24" className={className} style={{ ...style, color: `#${brand.hex}` }} fill="currentColor">
      <title>{brand.title}</title>
      <path d={brand.path} />
    </svg>
  ) : (
    <GroupIcon className={className} style={style} strokeWidth={strokeWidth} />
  );

  return <BrandLogo domain={cachedDomain} fallback={fallback} className={className} style={style} />;
}
