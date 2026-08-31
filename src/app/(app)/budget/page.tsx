"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { MetricCard } from "@/components/finance/metric-card";
import { ProgressIndicator, statusFromPct } from "@/components/finance/progress-indicator";
import { EditBudgetPopover } from "@/components/finance/edit-budget-popover";
import { resolveIcon } from "@/components/finance/icon-map";
import { useAppStore } from "@/lib/store";
import { formatINR, formatPercent } from "@/lib/calculations";
import { budgetLinesForMonth, previousMonthKeys, totalSpendForMonth } from "@/lib/selectors";

const CURRENT_MONTH = "2026-08";

export default function BudgetPage() {
  const { budgets, transactions, categories } = useAppStore();
  const lines = budgetLinesForMonth(budgets, transactions, categories, CURRENT_MONTH);

  const totalBudget = lines.reduce((s, l) => s + l.budget.limit, 0);
  const totalSpent = lines.reduce((s, l) => s + l.spent, 0);
  const remaining = totalBudget - totalSpent;
  const adherence = lines.length > 0 ? (lines.filter((l) => l.status !== "over").length / lines.length) * 100 : 100;

  const prevMonth = previousMonthKeys(CURRENT_MONTH, 1)[0];
  const prevSpend = totalSpendForMonth(transactions, prevMonth);
  const spendChangePct = prevSpend > 0 ? ((totalSpent - prevSpend) / prevSpend) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Budget</h1>
        <p className="text-sm text-muted-foreground">August 2026 · monthly category budgets</p>
      </div>

      <Card className="py-5">
        <CardContent className="grid grid-cols-2 gap-6 px-5 sm:grid-cols-4 sm:px-6">
          <MetricCard label="Total budget" value={formatINR(totalBudget, { compact: true })} size="lg" />
          <MetricCard
            label="Total spent"
            value={formatINR(totalSpent, { compact: true })}
            changePct={spendChangePct}
            changeLabel="vs last month"
            positiveIsGood={false}
            size="lg"
          />
          <MetricCard
            label="Remaining"
            value={formatINR(Math.abs(remaining), { compact: true })}
            size="lg"
          />
          <MetricCard label="Budget adherence" value={formatPercent(adherence, 0)} size="lg" />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lines.map((line) => {
          const Icon = resolveIcon(line.category.icon);
          const status = statusFromPct(line.pct);
          return (
            <Card key={line.budget.id} className="gap-3 py-4">
              <CardContent className="space-y-3 px-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-md bg-muted">
                      <Icon className="size-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium">{line.category.name}</span>
                  </div>
                  <EditBudgetPopover budgetId={line.budget.id} currentLimit={line.budget.limit} />
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-semibold tabular-nums">{formatINR(line.spent, { compact: true })}</span>
                  <span className="text-xs text-muted-foreground">of {formatINR(line.budget.limit, { compact: true })}</span>
                </div>

                <ProgressIndicator value={line.pct} status={status} />

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {line.remaining >= 0 ? (
                      <>
                        <ArrowDownRight className="inline size-3 text-positive" /> {formatINR(line.remaining, { compact: true })}{" "}
                        remaining
                      </>
                    ) : (
                      <>
                        <ArrowUpRight className="inline size-3 text-negative" /> {formatINR(Math.abs(line.remaining), { compact: true })}{" "}
                        over
                      </>
                    )}
                  </span>
                  <span>{formatPercent(line.pct, 0)}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
