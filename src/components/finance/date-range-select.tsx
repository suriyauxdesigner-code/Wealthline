"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type RangeOption = "this-month" | "last-month" | "this-quarter" | "this-year";

const OPTIONS: { value: RangeOption; label: string }[] = [
  { value: "this-month", label: "This month" },
  { value: "last-month", label: "Last month" },
  { value: "this-quarter", label: "This quarter" },
  { value: "this-year", label: "This year" },
];

export function DateRangeSelect({ value, onChange }: { value: RangeOption; onChange: (v: RangeOption) => void }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as RangeOption)}>
      <SelectTrigger size="sm" className="w-[150px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
