import { getAccount, getCategory } from "@/lib/mock-data";
import { formatINR } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/lib/types";
import { resolveIcon } from "./icon-map";

function formatRelativeDate(dateIso: string): string {
  const date = new Date(dateIso + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays < 7) return date.toLocaleDateString("en-IN", { weekday: "long" });
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function TransactionRow({ transaction, onClick }: { transaction: Transaction; onClick?: () => void }) {
  const category = getCategory(transaction.categoryId);
  const account = getAccount(transaction.accountId);
  const Icon = resolveIcon(category.icon);

  const isPositive = transaction.type === "income";
  const isNeutral = transaction.type === "transfer" || transaction.type === "investment";
  const sign = isPositive ? "+" : isNeutral ? "" : "-";

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-muted/50"
    >
      <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-full bg-[--tint]")} style={{ ["--tint" as string]: `color-mix(in oklch, var(--${category.color}) 15%, transparent)` }}>
        <Icon className="size-4" style={{ color: `var(--${category.color})` }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{transaction.merchant}</p>
        <p className="truncate text-xs text-muted-foreground">
          {category.name} · {account?.name ?? "—"}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p
          className={cn(
            "text-sm font-medium tabular-nums",
            isPositive ? "text-positive" : isNeutral ? "text-foreground" : "text-foreground"
          )}
        >
          {sign}
          {formatINR(transaction.amount)}
        </p>
        <p className="text-xs text-muted-foreground">{formatRelativeDate(transaction.date)}</p>
      </div>
    </button>
  );
}
