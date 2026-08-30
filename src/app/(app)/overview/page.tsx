"use client";

import * as React from "react";
import Link from "next/link";
import { Landmark, PiggyBank, TrendingUp, Wallet } from "lucide-react";

import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MetricCard } from "@/components/finance/metric-card";
import { CashFlowFunnel } from "@/components/finance/cash-flow-funnel";
import { TrendChart } from "@/components/finance/trend-chart";
import { SpendingBreakdownChart } from "@/components/finance/spending-breakdown-chart";
import { TransactionRow } from "@/components/finance/transaction-row";
import { InsightCard } from "@/components/finance/insight-card";
import { EmptyState } from "@/components/finance/empty-state";
import { DateRangeSelect, type RangeOption } from "@/components/finance/date-range-select";
import { useAppStore } from "@/lib/store";
import { netWorthHistory, portfolioHistory, user } from "@/lib/mock-data";
import { calcNetWorth, calcSavingsRate, formatINR } from "@/lib/calculations";
import { cashFlowForMonth, monthLabel, previousMonthKeys, spendByCategory } from "@/lib/selectors";
import { generateInsights } from "@/lib/insights";

const CURRENT_MONTH = "2026-08";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function OverviewPage() {
  const { transactions, accounts, budgets, fireProfile } = useAppStore();
  const [range, setRange] = React.useState<RangeOption>("this-month");

  const monthKey = range === "last-month" ? previousMonthKeys(CURRENT_MONTH, 1)[0] : CURRENT_MONTH;

  const cashFlow = cashFlowForMonth(transactions, monthKey);
  const savingsRate = calcSavingsRate(cashFlow.income, cashFlow.expenses);

  const lastSnapshot = netWorthHistory[netWorthHistory.length - 1];
  const prevSnapshot = netWorthHistory[netWorthHistory.length - 2];
  const netWorth = calcNetWorth(lastSnapshot.assets, lastSnapshot.liabilities);
  const prevNetWorth = calcNetWorth(prevSnapshot.assets, prevSnapshot.liabilities);
  const netWorthChangePct = ((netWorth - prevNetWorth) / Math.abs(prevNetWorth)) * 100;

  const cashTotal = accounts
    .filter((a) => (a.group === "cash" || a.group === "bank") && !a.isLiabilityAccount)
    .reduce((s, a) => s + a.balance, 0);

  const investmentsTotal = accounts
    .filter((a) => a.group === "investment" || a.group === "other")
    .reduce((s, a) => s + a.balance, 0);
  const prevPortfolio = portfolioHistory[portfolioHistory.length - 2];
  const investmentsChangePct = ((investmentsTotal - prevPortfolio.value) / prevPortfolio.value) * 100;

  const spend = spendByCategory(transactions, monthKey);
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  const trendData = portfolioHistory.slice(-12).map((p, i) => {
    const nw = netWorthHistory.slice(-12)[i];
    return {
      month: monthLabel(p.date).split(" ")[0],
      "Net worth": calcNetWorth(nw.assets, nw.liabilities),
    };
  });

  const insights = generateInsights({
    transactions,
    budgets,
    netWorthHistory,
    fireProfile,
    currentPortfolioValue: investmentsTotal,
    currentMonthKey: CURRENT_MONTH,
  }).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {greeting()}, {user.name}
          </h1>
          <p className="text-sm text-muted-foreground">Here&rsquo;s how your money is doing this month.</p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangeSelect value={range} onChange={setRange} />
          <AddTransactionDialog />
        </div>
      </div>

      <Card className="py-5">
        <CardContent className="grid grid-cols-2 gap-6 px-5 sm:grid-cols-4 sm:gap-4 sm:px-6">
          <MetricCard label="Net Worth" value={formatINR(netWorth, { compact: true })} changePct={netWorthChangePct} changeLabel="vs last month" icon={Landmark} size="lg" />
          <MetricCard label="Cash" value={formatINR(cashTotal, { compact: true })} icon={Wallet} size="lg" />
          <MetricCard label="Investments" value={formatINR(investmentsTotal, { compact: true })} changePct={investmentsChangePct} changeLabel="vs last month" icon={TrendingUp} size="lg" />
          <MetricCard label="Savings Rate" value={`${savingsRate.toFixed(1)}%`} icon={PiggyBank} size="lg" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Cash flow</CardTitle>
          </div>
          <span className="text-xs text-muted-foreground">{monthLabel(monthKey)}</span>
        </CardHeader>
        <CardContent className="space-y-6">
          <CashFlowFunnel income={cashFlow.income} expenses={cashFlow.expenses} investments={cashFlow.investments} remaining={cashFlow.remaining} />
          <Separator />
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Net worth trend (12 months)</p>
            <TrendChart
              data={trendData}
              xKey="month"
              series={[{ key: "Net worth", label: "Net worth", color: "var(--chart-1)", area: true }]}
              height={220}
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
