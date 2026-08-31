"use client";

import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { FireProjectionChart } from "@/components/finance/fire-projection-chart";
import { FinancialHealthCard } from "@/components/finance/financial-health-card";
import { useAppStore } from "@/lib/store";
import { formatINR, formatPercent, projectFire, calcFinancialHealth } from "@/lib/calculations";
import { cashFlowForMonth, totalSpendForMonth } from "@/lib/selectors";
import { cn } from "@/lib/utils";

const CURRENT_MONTH = "2026-08";

export default function FirePage() {
  const { fireProfile, updateFireProfile, accounts, liabilities, transactions } = useAppStore();

  const investmentsTotal = accounts
    .filter((a) => a.group === "investment" || a.group === "other")
    .reduce((s, a) => s + a.balance, 0);
  const cashTotal = accounts
    .filter((a) => (a.group === "cash" || a.group === "bank") && !a.isLiabilityAccount)
    .reduce((s, a) => s + a.balance, 0);
  const totalAssets = investmentsTotal + cashTotal;
  const totalLiabilities = liabilities.reduce((s, l) => s + l.outstanding, 0);

  const projection = React.useMemo(() => projectFire(fireProfile, investmentsTotal), [fireProfile, investmentsTotal]);

  // Baseline (before any what-if change) captured once on first render, so
  // the "insight" comparison always reflects "vs when you opened this page".
  // Only the initializer is ever used — never reassigned — so this is a
  // read-only useState rather than a ref accessed during render.
  const [baselineMonthlyInvestment] = React.useState(fireProfile.monthlyInvestment);
  const baselineProjection = React.useMemo(
    () => projectFire({ ...fireProfile, monthlyInvestment: baselineMonthlyInvestment }, investmentsTotal),
    [fireProfile, investmentsTotal, baselineMonthlyInvestment]
  );

  const monthlyExpenses = Math.round(fireProfile.annualExpenses / 12);

  const cashFlow = cashFlowForMonth(transactions, CURRENT_MONTH);
  const avgMonthlyExpenses = totalSpendForMonth(transactions, CURRENT_MONTH);
  const savingsRatePct = cashFlow.income > 0 ? ((cashFlow.income - cashFlow.expenses) / cashFlow.income) * 100 : 0;
  const investmentRatePct = cashFlow.income > 0 ? (cashFlow.investments / cashFlow.income) * 100 : 0;
  const emergencyFundMonths = avgMonthlyExpenses > 0 ? cashTotal / avgMonthlyExpenses : 0;
  const debtToAssetPct = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
  const assetClassCount = new Set(accounts.filter((a) => a.group === "investment" || a.group === "other").map((a) => a.type)).size;

  const health = calcFinancialHealth({
    savingsRatePct,
    investmentRatePct,
    emergencyFundMonths,
    debtToAssetPct,
    assetClassCount,
  });

  const weakestLabel: Record<string, string> = {
    savingsRate: "savings rate",
    investmentRate: "investment rate",
    emergencyFund: "emergency fund",
    debt: "debt load",
    diversification: "portfolio diversification",
  };

  // A single, plain-language headline replaces the old flat row of six
  // similarly-weighted numbers — everything else on the page supports this
  // one sentence instead of competing with it.
  const onTrack = projection.fireAge !== null && projection.fireAge <= fireProfile.targetAge;
  const yearsGap = projection.fireAge !== null ? Math.abs(projection.fireAge - fireProfile.targetAge) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">FIRE</h1>
        <p className="text-sm text-muted-foreground">Financial Independence, Retire Early — plan and simulate your path</p>
      </div>

      {/* Inputs come first — every number below is derived from these. */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Your inputs</CardTitle>
          <CardDescription>Change anything below and every calculation on this page updates instantly.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Simulate</p>
            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <SimSlider
                label="Monthly investment"
                value={fireProfile.monthlyInvestment}
                min={20000}
                max={100000}
                step={1000}
                format={(v) => formatINR(v, { compact: true })}
                onChange={(v) => updateFireProfile({ monthlyInvestment: v })}
              />
              <SimSlider
                label="Expected annual return"
                value={fireProfile.expectedReturn}
                min={6}
                max={14}
                step={0.5}
                format={(v) => `${v}%`}
                onChange={(v) => updateFireProfile({ expectedReturn: v })}
              />
              <SimSlider
                label="Target retirement age"
                value={fireProfile.targetAge}
                min={35}
                max={60}
                step={1}
                format={(v) => String(v)}
                onChange={(v) => updateFireProfile({ targetAge: v })}
              />
              <SimSlider
                label="Monthly expenses (retirement)"
                value={monthlyExpenses}
                min={20000}
                max={200000}
                step={1000}
                format={(v) => formatINR(v, { compact: true })}
                onChange={(v) => updateFireProfile({ annualExpenses: v * 12 })}
              />
            </div>
          </div>

          <div className="border-t border-border/70 pt-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Other assumptions</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              <AssumptionInput
                label="Current age"
                value={fireProfile.currentAge}
                onChange={(v) => updateFireProfile({ currentAge: v })}
              />
              <AssumptionInput
                label="Life expectancy"
                value={fireProfile.lifeExpectancy}
                onChange={(v) => updateFireProfile({ lifeExpectancy: v })}
              />
              <AssumptionInput
                label="Inflation %"
                value={fireProfile.inflation}
                onChange={(v) => updateFireProfile({ inflation: v })}
              />
              <AssumptionInput
                label="Income growth %"
                value={fireProfile.incomeGrowth}
                onChange={(v) => updateFireProfile({ incomeGrowth: v })}
              />
              <AssumptionInput
                label="Withdrawal rate %"
                value={fireProfile.withdrawalRate}
                onChange={(v) => updateFireProfile({ withdrawalRate: v })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* One clear headline instead of a flat grid of similarly-weighted numbers. */}
      <Card className={cn("py-5", onTrack ? "border-positive/30 bg-positive/5" : "border-warning/30 bg-warning/5")}>
        <CardContent className="flex flex-col gap-1 px-5 sm:px-6">
          {projection.fireAge === null ? (
            <p className="text-sm font-medium">
              At this pace, you won&apos;t reach financial independence within the projection window — try increasing
              your monthly investment above, or lowering your planned retirement expenses.
            </p>
          ) : onTrack ? (
            <p className="text-sm font-medium">
              You&apos;re on track — projected to reach financial independence at age{" "}
              <span className="text-base font-semibold">{projection.fireAge}</span>, in{" "}
              <span className="font-semibold">{projection.yearsRemaining}</span> years
              {yearsGap ? (
                <>
                  {" "}
                  — <span className="font-semibold">{yearsGap}</span> year{yearsGap === 1 ? "" : "s"} ahead of your
                  target age of {fireProfile.targetAge}.
                </>
              ) : (
                "."
              )}
            </p>
          ) : (
            <p className="text-sm font-medium">
              At this pace, you&apos;ll reach financial independence at age{" "}
              <span className="text-base font-semibold">{projection.fireAge}</span> — {yearsGap} year
              {yearsGap === 1 ? "" : "s"} later than your target age of {fireProfile.targetAge}. Increasing your
              monthly investment (below) is the fastest way to close that gap.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Supporting numbers, each captioned so it's clear what it means and
          how it differs from the others — not just a bare label + figure. */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="gap-2 py-4">
          <CardContent className="space-y-1 px-5">
            <p className="text-xs font-medium text-muted-foreground">Your FIRE number</p>
            <p className="text-2xl font-semibold tabular-nums tracking-tight">
              {formatINR(projection.fireNumberToday, { compact: true })}
            </p>
            <p className="text-xs text-muted-foreground">
              What you&apos;d need to retire today, at today&apos;s expenses and withdrawal rate.
            </p>
          </CardContent>
        </Card>

        <Card className="gap-2 py-4">
          <CardContent className="space-y-2 px-5">
            <p className="text-xs font-medium text-muted-foreground">Current investments</p>
            <p className="text-2xl font-semibold tabular-nums tracking-tight">
              {formatINR(investmentsTotal, { compact: true })}
            </p>
            <Progress value={projection.currentFirePercent} />
            <p className="text-xs text-muted-foreground">
              {formatPercent(projection.currentFirePercent, 1)} of your FIRE number, from investment accounts.
            </p>
          </CardContent>
        </Card>

        <Card className="gap-2 py-4">
          <CardContent className="space-y-1 px-5">
            <p className="text-xs font-medium text-muted-foreground">Required monthly SIP</p>
            <p className="text-2xl font-semibold tabular-nums tracking-tight">
              {formatINR(projection.requiredMonthlyInvestment, { compact: true })}
            </p>
            <p className="text-xs text-muted-foreground">
              To retire at exactly your target age of {fireProfile.targetAge} — a different question from &quot;at my
              current pace&quot; above.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">FIRE projection</CardTitle>
          <CardDescription>
            Your projected portfolio vs. the FIRE target — the target line rises with inflation each year, so it&apos;s
            higher than &quot;Your FIRE number&quot; above (which is in today&apos;s rupees).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FireProjectionChart points={projection.points} fireAge={projection.fireAge} />
        </CardContent>
      </Card>

      {baselineProjection.fireAge && projection.fireAge && baselineProjection.fireAge !== projection.fireAge && (
        <p className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-foreground">
          Your changes above move your estimated FIRE age from{" "}
          <span className="font-medium">{baselineProjection.fireAge}</span> to{" "}
          <span className="font-medium">{projection.fireAge}</span> — roughly{" "}
          <span className="font-medium">
            {Math.abs(baselineProjection.fireAge - projection.fireAge)} year
            {Math.abs(baselineProjection.fireAge - projection.fireAge) === 1 ? "" : "s"}
          </span>{" "}
          {projection.fireAge < baselineProjection.fireAge ? "sooner" : "later"} than when you opened this page.
        </p>
      )}

      <FinancialHealthCard
        result={health}
        insight={`Your ${weakestLabel[health.weakestFactor]} is below your recommended target — that's the highest-leverage place to focus next.`}
      />
    </div>
  );
}

function SimSlider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <Label>{label}</Label>
        <span className="font-medium tabular-nums">{format(value)}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} />
    </div>
  );
}

function AssumptionInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="tabular-nums"
      />
    </div>
  );
}
