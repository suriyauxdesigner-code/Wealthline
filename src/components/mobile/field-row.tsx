"use client";

import { ChevronRight } from "lucide-react";

// "Wealthline/Field row" — label stays visible, value never replaces it.
// Tappable (opens a picker view); for a freely-typed value use an <input>
// styled to match instead (see the Merchant field in the transaction sheet).
export function MobileFieldRow({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex h-16 w-full items-center justify-between border-b border-wl-border text-left last:border-b-0">
      <div className="flex flex-col gap-1">
        <span className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">{label}</span>
        <span className="text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink">{value}</span>
      </div>
      <ChevronRight className="size-[18px] shrink-0 text-wl-muted" />
    </button>
  );
}
