"use client";

import * as React from "react";
import { Check } from "lucide-react";

export interface ListPickerOption {
  id: string;
  label: string;
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
          className="flex h-14 items-center gap-3 border-b border-wl-border text-left last:border-b-0"
        >
          {o.icon}
          <span className="flex-1 text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink">{o.label}</span>
          {o.id === selectedId && <Check className="size-5 text-wl-accent" strokeWidth={2} />}
        </button>
      ))}
    </div>
  );
}
