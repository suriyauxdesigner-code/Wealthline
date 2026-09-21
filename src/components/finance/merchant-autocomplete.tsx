"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { setCachedBrand } from "@/lib/merchant-brand-cache";
import { resolveMerchantIcon, merchantInitials } from "@/lib/merchant-icons";
import { BrandLogo } from "./merchant-icon";
import { useMerchantSuggestions, type MerchantSuggestion } from "@/hooks/use-merchant-suggestions";

interface MerchantAutocompleteProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onSelectBrand?: (brand: MerchantSuggestion) => void;
  pastMerchantNames: string[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function SuggestionIcon({ suggestion }: { suggestion: MerchantSuggestion }) {
  const brand = resolveMerchantIcon(suggestion.name);
  const fallback = brand ? (
    <svg role="img" viewBox="0 0 24 24" className="size-5 shrink-0" style={{ color: `#${brand.hex}` }} fill="currentColor">
      <path d={brand.path} />
    </svg>
  ) : (
    <span className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-muted text-[10px] font-medium text-muted-foreground">
      {merchantInitials(suggestion.name)}
    </span>
  );
  return <BrandLogo domain={suggestion.domain} fallback={fallback} className="size-5 shrink-0 rounded-sm object-contain" />;
}

// Desktop free-text merchant field with a suggestion dropdown: the user's
// own past merchants (and any brand they've previously picked) appear
// instantly, a debounced Brandfetch search is appended once it resolves.
// Typing and pressing on without picking anything keeps working exactly
// like a plain text field — nothing here requires a selection.
export function MerchantAutocomplete({
  id,
  value,
  onChange,
  onSelectBrand,
  pastMerchantNames,
  placeholder,
  disabled,
  className,
}: MerchantAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [highlighted, setHighlighted] = React.useState(0);
  const { suggestions } = useMerchantSuggestions(value, pastMerchantNames);

  function select(suggestion: MerchantSuggestion) {
    onChange(suggestion.name);
    if (suggestion.domain) {
      const brand = { name: suggestion.name, domain: suggestion.domain, icon: suggestion.icon };
      setCachedBrand(suggestion.name, brand);
      onSelectBrand?.(suggestion);
    }
    setOpen(false);
  }

  return (
    <div className="relative flex-1">
      <Input
        id={id}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setHighlighted(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (!open || suggestions.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlighted((i) => Math.min(i + 1, suggestions.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlighted((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter" && suggestions[highlighted]) {
            e.preventDefault();
            select(suggestions[highlighted]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        autoComplete="off"
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
      />
      {open && suggestions.length > 0 && (
        <div className="bg-popover text-popover-foreground absolute top-full z-50 mt-1 w-full max-h-64 overflow-y-auto rounded-md border p-1 shadow-md">
          {suggestions.map((s, i) => (
            <button
              key={`${s.domain ?? s.name}-${i}`}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select(s)}
              className={cn(
                "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm",
                i === highlighted ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <SuggestionIcon suggestion={s} />
              <span className="truncate">{s.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
