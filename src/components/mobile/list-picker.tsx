"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ListPickerOption {
  id: string;
  label: string;
  /** Shown muted under the label — e.g. an account's balance, matching Figma's "Choose account" sheet. */
  subtitle?: string;
  icon?: React.ReactNode;
}

// Shared list view for in-sheet pickers (category, account, …) — a simple
// scrollable list with a checkmark on the selected row, matching the
// "Expense category" screen's pattern.
export function MobileListPicker({
  options,
  selectedId,
  onSelect,
}: {
  options: ListPickerOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-col">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onSelect(o.id)}
          className={cn("flex items-center gap-3 border-b border-wl-border text-left last:border-b-0", o.subtitle ? "h-16" : "h-14")}
        >
          {o.icon}
          <span className="flex flex-1 flex-col">
            <span className="text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink">{o.label}</span>
            {o.subtitle && <span className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">{o.subtitle}</span>}
          </span>
          {o.id === selectedId && <Check className="size-5 shrink-0 text-wl-accent" strokeWidth={2} />}
        </button>
      ))}
    </div>
  );
}
