import { formatINR, formatPercent } from "@/lib/calculations";
import { resolveIcon } from "./icon-map";
import type { CategorySpend } from "@/lib/selectors";

export function SpendingBreakdownChart({ data }: { data: CategorySpend[] }) {
  const max = Math.max(...data.map((d) => d.total), 1);

  return (
    <ul className="space-y-3">
      {data.map((d) => {
        const Icon = resolveIcon(d.category.icon);
        return (
          <li key={d.category.id} className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm">
              <Icon className="size-3.5 text-muted-foreground" />
              <span className="font-medium">{d.category.name}</span>
              <span className="ml-auto tabular-nums">{formatINR(d.total, { compact: true })}</span>
              <span className="w-11 text-right text-xs text-muted-foreground tabular-nums">
                {formatPercent(d.pctOfTotal, 0)}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(d.total / max) * 100}%`,
                  backgroundColor: `var(--${d.category.color})`,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
