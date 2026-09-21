"use client";

import { MerchantIcon } from "@/components/finance/merchant-icon";
import { MobileBrandSearchField } from "./brand-search-field";
import type { MerchantSuggestion } from "@/hooks/use-merchant-suggestions";

interface MobileMerchantFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSelectBrand?: (brand: MerchantSuggestion) => void;
  pastMerchantNames: string[];
  categoryIcon: string;
}

// Merchant-specific instance of MobileBrandSearchField: the live preview
// icon falls back to the transaction's category icon (matching MerchantIcon
// everywhere else) instead of a generic one.
export function MobileMerchantField({
  label,
  placeholder,
  value,
  onChange,
  onSelectBrand,
  pastMerchantNames,
  categoryIcon,
}: MobileMerchantFieldProps) {
  return (
    <MobileBrandSearchField
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onSelectBrand={onSelectBrand}
      pastNames={pastMerchantNames}
      icon={<MerchantIcon merchant={value} categoryIcon={categoryIcon} className="size-6 shrink-0 text-wl-muted" />}
    />
  );
}
