"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowDown, ArrowLeftRight, Landmark, LineChart, Plus, PiggyBank, TrendingUp, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Rise } from "cube-motion/react";

import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import { MobileAddTransactionSheet } from "@/components/mobile/add-transaction-sheet";
import { MobileAddInvestmentSheet } from "@/components/mobile/add-investment-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MetricCard } from "@/components/finance/metric-card";
import { CashFlowFunnel } from "@/components/finance/cash-flow-funnel";
import { SpendingBreakdownChart } from "@/components/finance/spending-breakdown-chart";
import { TransactionRow } from "@/components/finance/transaction-row";
import { MobileTransactionRow } from "@/components/finance/mobile-transaction-row";
import { InsightCard } from "@/components/finance/insight-card";
import { EmptyState } from "@/components/finance/empty-state";
import { DateRangeSelect, type RangeOption } from "@/components/finance/date-range-select";
import { displayName, useAuthUser } from "@/hooks/use-auth-user";
import { useAppStore } from "@/lib/store";
import { calcSavingsRate, formatINR } from "@/lib/calculations";
import { calcNetWorthBreakdown } from "@/lib/net-worth-selectors";
import { cashFlowForRange, getCurrentMonthKey, resolvePeriod, spendByCategoryForRange } from "@/lib/selectors";
import { generateInsights } from "@/lib/insights";

type MobileQuickActionType = "expense" | "income" | "transfer";

function QuickActionTile({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex h-[112px] flex-1 flex-col items-start justify-between rounded-lg bg-wl-surface p-4 text-left">
      <Icon className="size-6 text-wl-ink" strokeWidth={1.75} />
      <span className="text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-ink">{label}</span>
    </button>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function OverviewPage() {
  const { transactions, accounts, categories, budgets, liabilities, otherAssets, fireProfile, goals } = useAppStore();
  const authUser = useAuthUser();
  const [mobileSheetType, setMobileSheetType] = React.useState<MobileQuickActionType | null>(null);
  const [mobileInvestOpen, setMobileInvestOpen] = React.useState(false);
  const [range, setRange] = React.useState<RangeOption>("this-month");
  const [customRange, setCustomRange] = React.useState(() => {
    const today = new Date();
    return { start: new Date(today.getFullYear(), today.getMonth(), 1), end: today };
  });

  const today = new Date();
  const period = resolvePeriod(range, today, customRange);

  const cashFlow = cashFlowForRange(transactions, period.start, period.end);
  const savingsRate = calcSavingsRate(cashFlow.income, cashFlow.expenses);

  const breakdown = calcNetWorthBreakdown(accounts, liabilities, otherAssets);
  const cashTotal = breakdown.cash + breakdown.bank;
  const investmentsTotal = breakdown.investments;

  const spend = spendByCategoryForRange(transactions, categories, period.start, period.end);
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  // Home (mobile) always shows "this month", independent of the desktop
  // period selector above.
  const thisMonth = resolvePeriod("this-month", today);
  const thisMonthCashFlow = cashFlowForRange(transactions, thisMonth.start, thisMonth.end);
  const primaryGoal = goals[0];
  const goalPct = primaryGoal && primaryGoal.targetAmount > 0 ? Math.min(100, (primaryGoal.currentAmount / primaryGoal.targetAmount) * 100) : 0;
  const firstName = displayName(authUser).split(" ")[0];

  const insights = generateInsights({
    transactions,
    categories,
    budgets,
    netWorthHistory: [],
    fireProfile,
    currentPortfolioValue: investmentsTotal,
    currentMonthKey: getCurrentMonthKey(today),
  }).slice(0, 3);

  return (
    <>
      <Rise as="div" targets="children" className="wl-mobile -mx-4 -mt-5 min-h-svh bg-wl-canvas px-6 pt-3 pb-6 lg:hidden">
        <div className="flex items-center justify-between">
          <p className="text-[20px] font-semibold leading-7 tracking-[-0.8px] text-wl-ink">Wealthline</p>
          <div className="flex size-10 items-center justify-center rounded-full bg-wl-surface text-[14px] font-semibold text-wl-ink">
            {firstName.charAt(0).toUpperCase()}
          </div>
        </div>
        <h1 className="mt-3 text-[28px] font-semibold leading-9 tracking-[-1.12px] text-wl-ink">Hello, {firstName}</h1>

        {accounts.length === 0 ? (
          <div className="mt-3 rounded-lg bg-wl-surface p-4">
            <p className="text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink">Your story starts here</p>
            <p className="mt-1 text-[14px] font-medium leading-5 tracking-[-0.56px] text-wl-muted">
              Add an account, then record your first income or expense.
            </p>
            <Link
              href="/accounts"
              className="mt-4 flex h-[52px] items-center justify-center rounded-lg bg-wl-accent px-6 text-[15px] font-semibold tracking-[-0.6px] text-white"
            >
              Add your first account
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-3">
              <p className="text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-muted">Remaining this month</p>
              <p className="text-[64px] font-semibold leading-[72px] tracking-[-3.84px] text-wl-ink">{formatINR(thisMonthCashFlow.remaining)}</p>
              <p className="mt-1 text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-muted">
                {thisMonth.start.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </p>
            </div>

            <div className="mt-3 flex gap-2">
              <QuickActionTile icon={Plus} label="Expense" onClick={() => setMobileSheetType("expense")} />
              <QuickActionTile icon={ArrowDown} label="Income" onClick={() => setMobileSheetType("income")} />
              <QuickActionTile icon={ArrowLeftRight} label="Transfer" onClick={() => setMobileSheetType("transfer")} />
              <QuickActionTile icon={TrendingUp} label="Invest" onClick={() => setMobileInvestOpen(true)} />
            </div>

            {primaryGoal && (
              <Link href="/goals" className="mt-3 block rounded-lg bg-wl-surface p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-ink">{primaryGoal.name}</p>
                  <p className="shrink-0 text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">
                    {formatINR(primaryGoal.currentAmount)} / {formatINR(primaryGoal.targetAmount)}
                  </p>
                </div>
                <div className="mt-3 h-[3px] w-full bg-wl-disabled">
                  <div className="h-full bg-wl-accent" style={{ width: `${goalPct}%` }} />
                </div>
              </Link>
            )}

            <div className="mt-3">
              <div className="flex items-center justify-between">
                <p className="text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink">Recent activity</p>
                <Link href="/transactions" className="text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-muted">
                  See all
                </Link>
              </div>
              {recentTransactions.length === 0 ? (
                <p className="mt-3 text-[14px] font-medium leading-5 text-wl-muted">No activity yet.</p>
              ) : (
                <div className="mt-1 divide-y divide-wl-border">
                  {recentTransactions.slice(0, 3).map((t) => (
                    <MobileTransactionRow key={t.id} transaction={t} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </Rise>

      {mobileSheetType && (
        <MobileAddTransactionSheet
          open={!!mobileSheetType}
          onOpenChange={(v) => !v && setMobileSheetType(null)}
          defaultType={mobileSheetType}
        />
      )}

      {mobileInvestOpen && <MobileAddInvestmentSheet open={mobileInvestOpen} onOpenChange={setMobileInvestOpen} />}

      <div className="hidden space-y-6 lg:block">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {greeting()}, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {today.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangeSelect value={range} onChange={setRange} customRange={customRange} onCustomRangeChange={setCustomRange} />
          <AddTransactionDialog />
        </div>
      </div>

      <Card className="py-5">
        <CardContent className="grid grid-cols-2 gap-6 px-5 sm:grid-cols-4 sm:gap-4 sm:px-6">
          <MetricCard label="Net Worth" value={formatINR(breakdown.netWorth, { compact: true })} icon={Landmark} size="lg" />
          <MetricCard label="Cash" value={formatINR(cashTotal, { compact: true })} icon={Wallet} size="lg" />
          <MetricCard label="Investments" value={formatINR(investmentsTotal, { compact: true })} icon={TrendingUp} size="lg" />
          <MetricCard label="Savings Rate" value={`${savingsRate.toFixed(1)}%`} icon={PiggyBank} size="lg" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Cash flow</CardTitle>
          </div>
          <span className="text-xs text-muted-foreground">{period.label}</span>
        </CardHeader>
        <CardContent className="space-y-6">
          <CashFlowFunnel income={cashFlow.income} expenses={cashFlow.expenses} investments={cashFlow.investments} remaining={cashFlow.remaining} />
          <Separator />
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Net worth trend</p>
            <EmptyState
              icon={LineChart}
              title="History will build up over time"
              description="Check back after using Wealthline for a while to see your trend here."
              className="py-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Spending breakdown</CardTitle>
            <Link href="/reports" className="text-xs font-medium text-primary hover:underline">
              View report
            </Link>
          </CardHeader>
          <CardContent>
            {spend.length > 0 ? (
              <SpendingBreakdownChart data={spend} />
            ) : (
              <EmptyState icon={PiggyBank} title="No spending yet" description="Transactions you add this month will show up here." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Recent transactions</CardTitle>
            <Link href="/transactions" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-0.5">
            {recentTransactions.map((t) => (
              <TransactionRow key={t.id} transaction={t} />
            ))}
          </CardContent>
        </Card>
      </div>

      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Insights</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
          <Link href="/reports">See full financial reports →</Link>
        </Button>
      </div>
      </div>
    </>
  );
}
