"use client";

import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { MetricCard } from "@/components/finance/metric-card";
import { FireProjectionChart } from "@/components/finance/fire-projection-chart";
import { FinancialHealthCard } from "@/components/finance/financial-health-card";
import { useAppStore } from "@/lib/store";
import { formatINR, formatPercent, projectFire, calcFinancialHealth } from "@/lib/calculations";
import { cashFlowForMonth, totalSpendForMonth } from "@/lib/selectors";

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

  // Baseline (before any what-if change) held in a ref on first render, so
  // the "insight" comparison always reflects "vs when you opened this page".
  const baselineRef = React.useRef(fireProfile.monthlyInvestment);
  const baselineProjection = React.useMemo(
    () => projectFire({ ...fireProfile, monthlyInvestment: baselineRef.current }, investmentsTotal),
    [fireProfile, investmentsTotal]
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">FIRE</h1>
        <p className="text-sm text-muted-foreground">Financial Independence, Retire Early — plan and simulate your path</p>
      </div>

      <Card className="py-5">
        <CardContent className="grid grid-cols-2 gap-6 px-5 sm:grid-cols-3 lg:grid-cols-6 sm:px-6">
          <MetricCard label="FIRE Number" value={formatINR(projection.fireNumberToday, { compact: true })} />
          <MetricCard label="Current Corpus" value={formatINR(investmentsTotal, { compact: true })} />
          <MetricCard label="FIRE Progress" value={formatPercent(projection.currentFirePercent, 1)} />
          <MetricCard label="Est. FIRE Age" value={projection.fireAge ? String(projection.fireAge) : "—"} />
          <MetricCard
            label="Years Remaining"
            value={projection.yearsRemaining !== null ? String(projection.yearsRemaining) : "—"}
          />
          <MetricCard label="Required SIP" value={formatINR(projection.requiredMonthlyInvestment, { compact: true })} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">FIRE projection</CardTitle>
          <CardDescription>
            Projected portfolio value by age vs. your inflation-adjusted FIRE target
            {projection.fireAge && ` — on track for FIRE at age ${projection.fireAge}`}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FireProjectionChart points={projection.points} fireAge={projection.fireAge} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">What-if simulator</CardTitle>
            <CardDescription>Adjust assumptions and see the impact instantly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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

            {baselineProjection.fireAge && projection.fireAge && baselineProjection.fireAge !== projection.fireAge && (
              <p className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-foreground">
                This change moves your estimated FIRE age from{" "}
                <span className="font-medium">{baselineProjection.fireAge}</span> to{" "}
                <span className="font-medium">{projection.fireAge}</span> — roughly{" "}
                <span className="font-medium">
                  {Math.abs(baselineProjection.fireAge - projection.fireAge)} year
                  {Math.abs(baselineProjection.fireAge - projection.fireAge) === 1 ? "" : "s"}
                </span>{" "}
                {projection.fireAge < baselineProjection.fireAge ? "sooner" : "later"}.
              </p>
            )}
          </CardContent>
        </Card>

        <FinancialHealthCard
          result={health}
          insight={`Your ${weakestLabel[health.weakestFactor]} is below your recommended target — that's the highest-leverage place to focus next.`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Assumptions</CardTitle>
          <CardDescription>Every FIRE calculation is driven by these inputs — change them any time.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
        </CardContent>
      </Card>
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
