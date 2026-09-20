"use client";

import Link from "next/link";

import { formatINR } from "@/lib/calculations";
import { useAppStore } from "@/lib/store";
import type { Category, Transaction } from "@/lib/types";
import { resolveIcon } from "./icon-map";
import { formatRelativeDate } from "./transaction-row";

const FALLBACK_CATEGORY: Category = {
  id: "",
  name: "Other",
  kind: "expense",
  icon: "MoreHorizontal",
  color: "chart-9",
};

// Mobile redesign's "Wealthline/Transaction row" — amount first, context
// second, per the design system's component description.
export function MobileTransactionRow({ transaction }: { transaction: Transaction }) {
  const categories = useAppStore((s) => s.categories);
  const accounts = useAppStore((s) => s.accounts);
  const category = categories.find((c) => c.id === transaction.categoryId) ?? FALLBACK_CATEGORY;
  const account = accounts.find((a) => a.id === transaction.accountId);

  const isPositive = transaction.type === "income";
  const isNeutral = transaction.type === "transfer" || transaction.type === "investment";
  const sign = isPositive ? "+" : isNeutral ? "" : "−";

  return (
    <Link href="/transactions" className="flex h-[72px] items-center gap-3">
      {resolveIcon(category.icon)({ className: "size-6 shrink-0 text-wl-ink", strokeWidth: 1.75 })}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink">{transaction.merchant}</p>
        <p className="truncate text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">
          {formatRelativeDate(transaction.date)} · {account?.name ?? "—"}
        </p>
      </div>
      <p className="shrink-0 text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink">
        {sign}
        {formatINR(transaction.amount)}
      </p>
    </Link>
  );
}
