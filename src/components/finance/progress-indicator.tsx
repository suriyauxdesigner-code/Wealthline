import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export type IndicatorStatus = "healthy" | "near" | "over";

const STATUS_STYLES: Record<IndicatorStatus, { bar: string; text: string; label: string }> = {
  healthy: { bar: "bg-positive", text: "text-positive", label: "Healthy" },
  near: { bar: "bg-warning", text: "text-warning-foreground", label: "Near limit" },
  over: { bar: "bg-negative", text: "text-negative", label: "Over budget" },
};

export function ProgressIndicator({
  value,
  status,
  showLabel = true,
  className,
}: {
  value: number;
  status: IndicatorStatus;
  showLabel?: boolean;
  className?: string;
}) {
  const style = STATUS_STYLES[status];
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Progress value={Math.min(value, 100)} className="h-1.5 flex-1" indicatorClassName={style.bar} />
      {showLabel && <span className={cn("shrink-0 text-xs font-medium", style.text)}>{style.label}</span>}
    </div>
  );
}

export function statusFromPct(pct: number): IndicatorStatus {
  if (pct >= 100) return "over";
  if (pct >= 85) return "near";
  return "healthy";
}
