"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight, MoreHorizontal, Plus, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";

import { AddBudgetDialog } from "@/components/add-budget-dialog";
import { MobileAddBudgetSheet } from "@/components/mobile/add-budget-sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MetricCard } from "@/components/finance/metric-card";
import { EmptyState } from "@/components/finance/empty-state";
import { ProgressIndicator, statusFromPct } from "@/components/finance/progress-indicator";
import { EditBudgetPopover } from "@/components/finance/edit-budget-popover";
import { resolveIcon } from "@/components/finance/icon-map";
import { useAppStore } from "@/lib/store";
import { formatINR, formatPercent } from "@/lib/calculations";
import { budgetLinesForMonth, getCurrentMonthKey, monthLabel, previousMonthKeys, totalSpendForMonth } from "@/lib/selectors";
import type { Budget } from "@/lib/types";

export default function BudgetPage() {
  const { budgets, transactions, categories, deleteBudget } = useAppStore();
  const currentMonth = getCurrentMonthKey();
  const lines = budgetLinesForMonth(budgets, transactions, categories, currentMonth);
  const [mobileCreateOpen, setMobileCreateOpen] = React.useState(false);
  const [mobileEditingBudget, setMobileEditingBudget] = React.useState<Budget | null>(null);

  const totalBudget = lines.reduce((s, l) => s + l.budget.limit, 0);
  const totalSpent = lines.reduce((s, l) => s + l.spent, 0);
  const remaining = totalBudget - totalSpent;
  const adherence = lines.length > 0 ? (lines.filter((l) => l.status !== "over").length / lines.length) * 100 : 100;

  const prevMonth = previousMonthKeys(currentMonth, 1)[0];
  const prevSpend = totalSpendForMonth(transactions, prevMonth);
  const spendChangePct = prevSpend > 0 ? ((totalSpent - prevSpend) / prevSpend) * 100 : 0;

  return (
    <>
      <div className="wl-mobile -mx-4 -mt-5 min-h-svh bg-wl-canvas px-6 pt-3 pb-6 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[28px] font-semibold leading-9 tracking-[-1.12px] text-wl-ink">Budget</p>
          <button
            onClick={() => setMobileCreateOpen(true)}
            className="flex size-11 items-center justify-center rounded-lg bg-wl-surface"
          >
            <Plus className="size-[22px] text-wl-ink" strokeWidth={1.75} />
          </button>
        </div>
        <p className="mt-3 text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-muted">{monthLabel(currentMonth)}</p>

        {lines.length === 0 ? (
          <p className="mt-6 text-center text-[14px] font-medium text-wl-muted">
            No budgets yet — tap + to set a monthly limit for a category.
          </p>
        ) : (
          <>
            <div className="mt-3 flex flex-col gap-2">
              <p className="text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-muted">Left to spend</p>
              <p className="text-[48px] font-semibold leading-[56px] tracking-[-3.84px] text-wl-ink">{formatINR(Math.max(0, remaining))}</p>
              <p className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">
                {formatINR(totalSpent)} spent of {formatINR(totalBudget)} budget
              </p>
            </div>
            <div className="mt-2 h-[3px] w-full rounded-lg bg-wl-disabled">
              <div className="h-full rounded-lg bg-wl-accent" style={{ width: `${totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0}%` }} />
            </div>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-[20px] font-semibold leading-7 tracking-[-0.8px] text-wl-ink">Your categories</p>
            </div>
            <div className="mt-3 flex flex-col gap-3">
              {lines.map((line) => (
                <button
                  key={line.budget.id}
                  onClick={() => setMobileEditingBudget(line.budget)}
                  className="flex flex-col gap-3 rounded-lg bg-wl-surface p-4 text-left"
                >
                  <div className="flex items-center justify-between text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-ink">
                    <span>{line.category.name}</span>
                    <span>
                      {formatINR(line.spent)} / {formatINR(line.budget.limit)}
                    </span>
                  </div>
                  <div className="h-[3px] w-full rounded-lg bg-wl-disabled">
                    <div className="h-full rounded-lg bg-wl-accent" style={{ width: `${Math.min(100, line.pct)}%` }} />
                  </div>
                  <p className={`text-[12px] font-medium leading-4 tracking-[-0.48px] ${line.remaining >= 0 ? "text-wl-muted" : "text-wl-error"}`}>
                    {line.remaining >= 0 ? `${formatINR(line.remaining)} left` : `${formatINR(Math.abs(line.remaining))} over budget`}
                  </p>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {mobileCreateOpen && <MobileAddBudgetSheet open={mobileCreateOpen} onOpenChange={setMobileCreateOpen} />}
      {mobileEditingBudget && (
        <MobileAddBudgetSheet
          open={!!mobileEditingBudget}
          onOpenChange={(v) => !v && setMobileEditingBudget(null)}
          editBudget={mobileEditingBudget}
        />
      )}

      <div className="hidden space-y-6 lg:block">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Budget</h1>
          <p className="text-sm text-muted-foreground">{monthLabel(currentMonth)} · monthly category budgets</p>
        </div>
        <AddBudgetDialog />
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

      {lines.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Wallet}
              title="No budgets yet"
              description="Set a monthly limit for a category to start tracking it here."
              action={<AddBudgetDialog />}
            />
          </CardContent>
        </Card>
      ) : (
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
                  <div className="flex items-center">
                    <EditBudgetPopover budgetId={line.budget.id} currentLimit={line.budget.limit} />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-6 text-muted-foreground">
                          <MoreHorizontal className="size-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            deleteBudget(line.budget.id);
                            toast.success("Budget removed");
                          }}
                        >
                          <Trash2 /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
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
      )}
      </div>
    </>
  );
}
