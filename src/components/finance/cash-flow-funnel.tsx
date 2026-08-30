import { ArrowRight } from "lucide-react";

import { formatINR } from "@/lib/calculations";
import { cn } from "@/lib/utils";

export function CashFlowFunnel({
  income,
  expenses,
  investments,
  remaining,
}: {
  income: number;
  expenses: number;
  investments: number;
  remaining: number;
}) {
  const stages = [
    { label: "Income", value: income, color: "var(--chart-1)" },
    { label: "Expenses", value: expenses, color: "var(--negative)" },
    { label: "Investments", value: investments, color: "var(--chart-4)" },
    { label: "Remaining", value: remaining, color: remaining >= 0 ? "var(--positive)" : "var(--negative)" },
  ];
  const max = Math.max(income, 1);

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
      {stages.map((s, i) => (
        <div key={s.label} className="relative space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            {s.label}
            {i < stages.length - 1 && (
              <ArrowRight className="ml-auto size-3.5 text-muted-foreground/50 sm:hidden" />
            )}
          </div>
          <p
            className={cn(
              "text-xl font-semibold tabular-nums",
              s.label === "Remaining" ? (remaining >= 0 ? "text-positive" : "text-negative") : ""
            )}
          >
            {formatINR(s.value)}
          </p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (Math.abs(s.value) / max) * 100)}%`, backgroundColor: s.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
