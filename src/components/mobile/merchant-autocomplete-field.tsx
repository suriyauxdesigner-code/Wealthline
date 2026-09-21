"use client";

import * as React from "react";

import { MerchantIcon, BrandLogo } from "@/components/finance/merchant-icon";
import { setCachedBrand } from "@/lib/merchant-brand-cache";
import { resolveMerchantIcon, merchantInitials } from "@/lib/merchant-icons";
import { useMerchantSuggestions, type MerchantSuggestion } from "@/hooks/use-merchant-suggestions";

interface MobileMerchantFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSelectBrand?: (brand: MerchantSuggestion) => void;
  pastMerchantNames: string[];
  categoryIcon: string;
}

function SuggestionIcon({ suggestion }: { suggestion: MerchantSuggestion }) {
  const brand = resolveMerchantIcon(suggestion.name);
  const fallback = brand ? (
    <svg role="img" viewBox="0 0 24 24" className="size-6 shrink-0" style={{ color: `#${brand.hex}` }} fill="currentColor">
      <path d={brand.path} />
    </svg>
  ) : (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-wl-disabled text-[10px] font-semibold text-wl-muted">
      {merchantInitials(suggestion.name)}
    </span>
  );
  return <BrandLogo domain={suggestion.domain} fallback={fallback} className="size-6 shrink-0 rounded-sm object-contain" />;
}

// wl-mobile version of the merchant field: same field-row chrome as every
// other mobile sheet input, plus a live icon preview and a suggestion
// dropdown (the user's own past merchants first, a debounced Brandfetch
// search appended). Typing without picking a suggestion works exactly like
// the plain text field it replaces.
export function MobileMerchantField({
  label,
  placeholder,
  value,
  onChange,
  onSelectBrand,
  pastMerchantNames,
  categoryIcon,
}: MobileMerchantFieldProps) {
  const [open, setOpen] = React.useState(false);
  const { suggestions } = useMerchantSuggestions(value, pastMerchantNames);

  function select(s: MerchantSuggestion) {
    onChange(s.name);
    if (s.domain) {
      setCachedBrand(s.name, { name: s.name, domain: s.domain, icon: s.icon });
      onSelectBrand?.(s);
    }
    setOpen(false);
  }

  return (
    <div className="relative">
      <div className="flex h-16 items-center justify-between gap-3 border-b border-wl-border">
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <label className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">{label}</label>
          <input
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            placeholder={placeholder}
            autoComplete="off"
            className="w-full bg-transparent text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink placeholder:text-wl-muted focus:outline-none"
          />
        </div>
        <MerchantIcon merchant={value} categoryIcon={categoryIcon} className="size-6 shrink-0 text-wl-muted" />
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute inset-x-0 top-full z-10 mt-1 flex max-h-64 flex-col gap-0.5 overflow-y-auto rounded-lg border border-wl-border bg-wl-surface p-1 shadow-md">
          {suggestions.map((s, i) => (
            <button
              key={`${s.domain ?? s.name}-${i}`}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select(s)}
              className="flex items-center gap-2 rounded-md px-2 py-2 text-left"
            >
              <SuggestionIcon suggestion={s} />
              <span className="truncate text-[14px] font-medium text-wl-ink">{s.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
