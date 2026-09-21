"use client";

import * as React from "react";
import { Download, LineChart } from "lucide-react";
import { Rise } from "cube-motion/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/finance/empty-state";
import { TrendChart } from "@/components/finance/trend-chart";
import { InsightCard } from "@/components/finance/insight-card";
import { useAppStore } from "@/lib/store";
import { calcSavingsRate, formatINR, formatPercent } from "@/lib/calculations";
import { cashFlowForMonth, getCurrentMonthKey, monthLabel, previousMonthKeys } from "@/lib/selectors";
import { generateInsights } from "@/lib/insights";
import { toast } from "sonner";

function lastMonthKeys(currentMonthKey: string, count: number): string[] {
  const [y, m] = currentMonthKey.split("-").map(Number);
  const out: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(y, m - 1 - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

export default function ReportsPage() {
  const { transactions, budgets, categories, fireProfile, accounts } = useAppStore();
  const currentMonth = getCurrentMonthKey();
  const months = lastMonthKeys(currentMonth, 12);
  const [mobileMonthsAgo, setMobileMonthsAgo] = React.useState(0);
  const mobileMonth = mobileMonthsAgo === 0 ? currentMonth : previousMonthKeys(currentMonth, mobileMonthsAgo)[0];
  const mobileCashFlow = cashFlowForMonth(transactions, mobileMonth);
  const mobileIncomePct = mobileCashFlow.income > 0 ? (mobileCashFlow.remaining / mobileCashFlow.income) * 100 : 0;

  const monthlyRows = months.map((m) => {
    const cf = cashFlowForMonth(transactions, m);
    const savingsRate = calcSavingsRate(cf.income, cf.expenses);
    return { month: m, ...cf, savingsRate };
  });

  const trendData = monthlyRows.map((r) => ({
    month: monthLabel(r.month).split(" ")[0],
    Income: r.income,
    Expenses: r.expenses,
  }));

  const savingsRateData = monthlyRows.map((r) => ({
    month: monthLabel(r.month).split(" ")[0],
    "Savings rate": Number(r.savingsRate.toFixed(1)),
  }));

  const investmentsTotal = accounts
    .filter((a) => a.group === "investment" || a.group === "other")
    .reduce((s, a) => s + a.balance, 0);

  const insights = generateInsights({
    transactions,
    categories,
    budgets,
    netWorthHistory: [],
    fireProfile,
    currentPortfolioValue: investmentsTotal,
    currentMonthKey: currentMonth,
  });

  function exportSummary() {
    const header = ["Month", "Income", "Expenses", "Investments", "Remaining", "Savings Rate %"];
    const lines = monthlyRows.map((r) =>
      [r.month, r.income, r.expenses, r.investments, r.remaining, r.savingsRate.toFixed(1)].join(",")
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "yearly-financial-summary.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported");
  }

  return (
    <>
      <Rise as="div" targets="children" className="wl-mobile -mx-4 -mt-5 min-h-svh bg-wl-canvas px-6 pt-3 pb-6 lg:hidden">
        <p className="text-[28px] font-semibold leading-9 tracking-[-1.12px] text-wl-ink">Reports</p>

        <button
          onClick={() => setMobileMonthsAgo((v) => (v >= 11 ? 0 : v + 1))}
          className="mt-3 flex h-16 w-full flex-col justify-center gap-1 text-left"
        >
          <span className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Period</span>
          <span className="text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink">{monthLabel(mobileMonth)}</span>
        </button>

        <p className="mt-3 text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-muted">Income left after expenses</p>
        <p className="text-[48px] font-semibold leading-[56px] tracking-[-3.84px] text-wl-ink">{formatINR(mobileCashFlow.remaining)}</p>
        <p className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">
          {formatPercent(mobileIncomePct, 1)} of this month&apos;s income
        </p>

        <div className="mt-3 flex flex-col gap-3 rounded-lg bg-wl-surface p-4">
          {(
            [
              ["Income", mobileCashFlow.income, mobileCashFlow.income > 0 ? 100 : 0],
              ["Expenses", mobileCashFlow.expenses, mobileCashFlow.income > 0 ? Math.min(100, (mobileCashFlow.expenses / mobileCashFlow.income) * 100) : 0],
              ["Invested this month", mobileCashFlow.investments, mobileCashFlow.income > 0 ? Math.min(100, (mobileCashFlow.investments / mobileCashFlow.income) * 100) : 0],
            ] as const
          ).map(([label, value, pct]) => (
            <div key={label} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-ink">
                <span>{label}</span>
                <span>{formatINR(value)}</span>
              </div>
              <div className="h-[3px] w-full rounded-lg bg-wl-disabled">
                <div className="h-full rounded-lg bg-wl-accent" style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-col gap-1 rounded-lg bg-wl-surface p-4">
          <div className="flex items-center justify-between text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-ink">
            <span>Remaining this month</span>
            <span>{formatINR(mobileCashFlow.remaining)}</span>
          </div>
          <p className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Income − expenses − investment contributions</p>
        </div>

        <p className="mt-3 text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Choose a longer period to compare recorded months.</p>
      </Rise>

      <div className="hidden space-y-6 lg:block">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">Trailing 12 months · {monthLabel(months[0])} – {monthLabel(months[months.length - 1])}</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportSummary}>
          <Download /> Export summary
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Income vs. expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart
              data={trendData}
              xKey="month"
              series={[
                { key: "Income", label: "Income", color: "var(--chart-1)" },
                { key: "Expenses", label: "Expenses", color: "var(--negative)" },
              ]}
              height={240}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Savings rate trend</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart
              data={savingsRateData}
              xKey="month"
              series={[{ key: "Savings rate", label: "Savings rate", color: "var(--chart-4)", area: true }]}
              height={240}
              compactCurrency={false}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Net worth growth</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={LineChart}
              title="History will build up over time"
              description="Check back after using Wealthline for a while to see this trend."
              className="py-14"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Investment performance</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={LineChart}
              title="History will build up over time"
              description="Check back after using Wealthline for a while to see this trend."
              className="py-14"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Insights</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {insights.map((i) => (
            <InsightCard key={i.id} insight={i} />
          ))}
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardHeader className="border-b border-border/70 py-4">
          <CardTitle className="text-sm font-medium">Yearly financial summary</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Month</TableHead>
                <TableHead className="text-right">Income</TableHead>
                <TableHead className="text-right">Expenses</TableHead>
                <TableHead className="text-right">Investments</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
                <TableHead className="pr-4 text-right">Savings rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyRows.map((r) => (
                <TableRow key={r.month}>
                  <TableCell className="pl-4 font-medium">{monthLabel(r.month)}</TableCell>
                  <TableCell className="text-right tabular-nums text-positive">{formatINR(r.income, { compact: true })}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatINR(r.expenses, { compact: true })}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatINR(r.investments, { compact: true })}</TableCell>
                  <TableCell className={`text-right tabular-nums ${r.remaining >= 0 ? "text-positive" : "text-negative"}`}>
                    {formatINR(r.remaining, { compact: true })}
                  </TableCell>
                  <TableCell className="pr-4 text-right tabular-nums font-medium">{formatPercent(r.savingsRate, 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
