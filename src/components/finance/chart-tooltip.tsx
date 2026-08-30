import { formatINR } from "@/lib/calculations";

export interface ChartTooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

export function ChartTooltip({
  active,
  label,
  payload,
  compact = true,
}: {
  active?: boolean;
  label?: string;
  payload?: { name?: string; value?: number | string; color?: string; dataKey?: string }[];
  compact?: boolean;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
      {label && <p className="mb-1 font-medium text-popover-foreground">{label}</p>}
      <div className="space-y-0.5">
        {payload.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-muted-foreground">{item.name}</span>
            <span className="ml-auto font-medium tabular-nums text-popover-foreground">
              {typeof item.value === "number" ? formatINR(item.value, { compact }) : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
