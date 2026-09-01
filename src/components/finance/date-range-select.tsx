"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { resolvePeriod, type RangeOption } from "@/lib/selectors";

export type { RangeOption };

const ALL_OPTIONS: RangeOption[] = ["this-month", "last-month", "this-quarter", "this-year", "custom"];

interface DateRangeSelectProps {
  value: RangeOption;
  onChange: (v: RangeOption) => void;
  customRange: { start: Date; end: Date };
  onCustomRangeChange: (r: { start: Date; end: Date }) => void;
}

export function DateRangeSelect({ value, onChange, customRange, onCustomRangeChange }: DateRangeSelectProps) {
  const today = new Date();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={value} onValueChange={(v) => onChange(v as RangeOption)}>
        <SelectTrigger size="sm" className="w-[170px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ALL_OPTIONS.map((o) => (
            <SelectItem key={o} value={o}>
              {o === "custom" ? "Custom range" : resolvePeriod(o, today).label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value === "custom" && (
        <div className="flex items-center gap-1.5">
          <DatePicker date={customRange.start} onSelect={(d) => d && onCustomRangeChange({ ...customRange, start: d })} />
          <span className="text-xs text-muted-foreground">to</span>
          <DatePicker date={customRange.end} onSelect={(d) => d && onCustomRangeChange({ ...customRange, end: d })} />
        </div>
      )}
    </div>
  );
}
