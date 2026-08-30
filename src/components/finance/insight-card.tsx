import { AlertTriangle, CheckCircle2, Info, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Insight, InsightSeverity } from "@/lib/types";

const SEVERITY_STYLES: Record<InsightSeverity, { icon: typeof Info; className: string; iconClass: string }> = {
  positive: { icon: CheckCircle2, className: "border-positive/25 bg-positive/5", iconClass: "text-positive" },
  info: { icon: Info, className: "border-primary/20 bg-primary/5", iconClass: "text-primary" },
  warning: { icon: TriangleAlert, className: "border-warning/30 bg-warning/10", iconClass: "text-warning-foreground" },
  action: { icon: AlertTriangle, className: "border-negative/25 bg-negative/5", iconClass: "text-negative" },
};

export function InsightCard({ insight }: { insight: Insight }) {
  const style = SEVERITY_STYLES[insight.severity];
  const Icon = style.icon;
  return (
    <div className={cn("flex gap-3 rounded-lg border px-3.5 py-3", style.className)}>
      <Icon className={cn("mt-0.5 size-4 shrink-0", style.iconClass)} />
      <div className="space-y-0.5">
        <p className="text-sm font-medium leading-snug">{insight.title}</p>
        <p className="text-sm text-muted-foreground leading-snug">{insight.description}</p>
      </div>
    </div>
  );
}
