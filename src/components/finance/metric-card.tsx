import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatPercent } from "@/lib/calculations";

export function MetricCard({
  label,
  value,
  changePct,
  changeLabel,
  icon: Icon,
  positiveIsGood = true,
  size = "default",
  className,
}: {
  label: string;
  value: string;
  changePct?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  positiveIsGood?: boolean;
  size?: "default" | "lg";
  className?: string;
}) {
  const hasChange = typeof changePct === "number";
  const isGood = hasChange ? (positiveIsGood ? changePct! >= 0 : changePct! < 0) : true;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span
        className={cn(
          "font-semibold tabular-nums tracking-tight",
          size === "lg" ? "text-3xl" : "text-2xl"
        )}
      >
        {value}
      </span>
      {hasChange && (
        <div className={cn("flex items-center gap-1 text-xs font-medium", isGood ? "text-positive" : "text-negative")}>
          {changePct! >= 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
          <span>{formatPercent(changePct!, 1)}</span>
          {changeLabel && <span className="font-normal text-muted-foreground">{changeLabel}</span>}
        </div>
      )}
    </div>
  );
}
