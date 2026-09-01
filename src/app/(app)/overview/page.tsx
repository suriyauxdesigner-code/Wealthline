"use client";

import * as React from "react";
import Link from "next/link";
import { Landmark, LineChart, PiggyBank, TrendingUp, Wallet } from "lucide-react";

import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MetricCard } from "@/components/finance/metric-card";
import { CashFlowFunnel } from "@/components/finance/cash-flow-funnel";
import { SpendingBreakdownChart } from "@/components/finance/spending-breakdown-chart";
import { TransactionRow } from "@/components/finance/transaction-row";
import { InsightCard } from "@/components/finance/insight-card";
import { EmptyState } from "@/components/finance/empty-state";
import { DateRangeSelect, type RangeOption } from "@/components/finance/date-range-select";
import { displayName, useAuthUser } from "@/hooks/use-auth-user";
import { useAppStore } from "@/lib/store";
import { calcSavingsRate, formatINR } from "@/lib/calculations";
import { calcNetWorthBreakdown } from "@/lib/net-worth-selectors";
import { cashFlowForRange, getCurrentMonthKey, resolvePeriod, spendByCategoryForRange } from "@/lib/selectors";
import { generateInsights } from "@/lib/insights";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function OverviewPage() {
  const { transactions, accounts, categories, budgets, liabilities, otherAssets, fireProfile } = useAppStore();
  const authUser = useAuthUser();
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {greeting()}, {displayName(authUser).split(" ")[0]}
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
  );
}
