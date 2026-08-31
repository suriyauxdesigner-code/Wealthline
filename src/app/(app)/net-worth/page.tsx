"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AddLiabilityDialog } from "@/components/add-liability-dialog";
import { AddOtherAssetDialog } from "@/components/add-other-asset-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/finance/metric-card";
import { TrendChart } from "@/components/finance/trend-chart";
import { useAppStore } from "@/lib/store";
import { netWorthHistory } from "@/lib/mock-data";
import { calcCAGR, calcNetWorth, formatINR } from "@/lib/calculations";
import { monthLabel } from "@/lib/selectors";

export default function NetWorthPage() {
  const { accounts, liabilities, otherAssets, deleteLiability, deleteOtherAsset } = useAppStore();

  const cash = accounts.filter((a) => a.group === "cash").reduce((s, a) => s + a.balance, 0);
  const bank = accounts.filter((a) => a.group === "bank").reduce((s, a) => s + a.balance, 0);
  const investmentsTotal = accounts
    .filter((a) => a.group === "investment" || a.group === "other")
    .reduce((s, a) => s + a.balance, 0);
  const vehicles = otherAssets.filter((o) => o.category === "vehicle").reduce((s, o) => s + o.value, 0);
  const property = otherAssets.filter((o) => o.category === "property").reduce((s, o) => s + o.value, 0);
  const otherAssetsTotal = otherAssets.filter((o) => o.category === "other").reduce((s, o) => s + o.value, 0);

  const assetRows = [
    { label: "Cash", value: cash },
    { label: "Bank accounts", value: bank },
    { label: "Investments", value: investmentsTotal },
    { label: "Vehicles", value: vehicles },
    { label: "Property", value: property },
    { label: "Other assets", value: otherAssetsTotal },
  ].filter((r) => r.value > 0);

  const LIABILITY_LABEL: Record<string, string> = {
    credit_card: "Credit cards",
    personal_loan: "Personal loans",
    vehicle_loan: "Vehicle loans",
    home_loan: "Home loans",
    education_loan: "Education loans",
    other: "Other debt",
  };
  const liabilityTotals = new Map<string, number>();
  for (const l of liabilities) {
    liabilityTotals.set(l.type, (liabilityTotals.get(l.type) ?? 0) + l.outstanding);
  }
  const liabilityRows = Array.from(liabilityTotals.entries()).map(([type, value]) => ({
    label: LIABILITY_LABEL[type] ?? type,
    value,
  }));

  const totalAssets = assetRows.reduce((s, r) => s + r.value, 0);
  const totalLiabilities = liabilityRows.reduce((s, r) => s + r.value, 0);
  const netWorth = calcNetWorth(totalAssets, totalLiabilities);

  const last = netWorthHistory[netWorthHistory.length - 1];
  const prevMonth = netWorthHistory[netWorthHistory.length - 2];
  const prevYear = netWorthHistory[netWorthHistory.length - 13] ?? netWorthHistory[0];
  const first = netWorthHistory[0];

  const monthlyChange = calcNetWorth(last.assets, last.liabilities) - calcNetWorth(prevMonth.assets, prevMonth.liabilities);
  const annualChange = calcNetWorth(last.assets, last.liabilities) - calcNetWorth(prevYear.assets, prevYear.liabilities);
  const years = (netWorthHistory.length - 1) / 12;
  const cagr = calcCAGR(calcNetWorth(first.assets, first.liabilities), calcNetWorth(last.assets, last.liabilities), years);
  const assetGrowthPct = ((last.assets - first.assets) / first.assets) * 100;
  const debtReduction = first.liabilities - last.liabilities;

  const trendData = netWorthHistory.map((n) => ({
    month: monthLabel(n.date),
    "Net worth": calcNetWorth(n.assets, n.liabilities),
  }));
  // thin ticks: keep every 4th label readable by relying on chart's minTickGap

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Net Worth</h1>
        <p className="text-sm text-muted-foreground">Assets − Liabilities = Net Worth</p>
      </div>

      <Card className="py-5">
        <CardContent className="grid grid-cols-2 gap-6 px-5 sm:grid-cols-4 sm:px-6">
          <MetricCard label="Net Worth" value={formatINR(netWorth, { compact: true })} size="lg" />
          <MetricCard label="Monthly change" value={formatINR(monthlyChange, { compact: true })} changePct={(monthlyChange / (netWorth - monthlyChange)) * 100} size="lg" />
          <MetricCard label="Annual change" value={formatINR(annualChange, { compact: true })} changePct={(annualChange / (netWorth - annualChange)) * 100} size="lg" />
          <MetricCard label="CAGR" value={`${cagr.toFixed(1)}%`} size="lg" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Net worth growth</CardTitle>
        </CardHeader>
        <CardContent>
          <TrendChart
            data={trendData}
            xKey="month"
            series={[{ key: "Net worth", label: "Net worth", color: "var(--chart-1)", area: true }]}
            height={300}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Assets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {assetRows.map((r) => (
              <Row key={r.label} label={r.label} value={r.value} total={totalAssets} color="var(--positive)" />
            ))}
            <div className="flex items-center justify-between border-t border-border/70 pt-3 text-sm font-semibold">
              <span>Total assets</span>
              <span className="tabular-nums">{formatINR(totalAssets)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Liabilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {liabilityRows.map((r) => (
              <Row key={r.label} label={r.label} value={r.value} total={totalLiabilities} color="var(--negative)" />
            ))}
            <div className="flex items-center justify-between border-t border-border/70 pt-3 text-sm font-semibold">
              <span>Total liabilities</span>
              <span className="tabular-nums">{formatINR(totalLiabilities)}</span>
            </div>
            <p className="pt-1 text-xs text-muted-foreground">
              Paid down {formatINR(debtReduction, { compact: true })} in liabilities over the last {Math.round(years)} years ·
              assets grew {assetGrowthPct.toFixed(0)}% in the same period.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Manage liabilities</CardTitle>
            <AddLiabilityDialog />
          </CardHeader>
          <CardContent className="space-y-1">
            {liabilities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No liabilities added yet.</p>
            ) : (
              liabilities.map((l) => (
                <div key={l.id} className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-muted/50">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{l.name}</p>
                    <p className="text-xs text-muted-foreground">{formatINR(l.outstanding, { compact: true })} outstanding</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0 text-muted-foreground hover:text-negative"
                    onClick={() => {
                      deleteLiability(l.id);
                      toast.success("Liability removed");
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Manage other assets</CardTitle>
            <AddOtherAssetDialog />
          </CardHeader>
          <CardContent className="space-y-1">
            {otherAssets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No other assets added yet.</p>
            ) : (
              otherAssets.map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-muted/50">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{o.name}</p>
                    <p className="text-xs capitalize text-muted-foreground">{o.category}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm tabular-nums">{formatINR(o.value, { compact: true })}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-negative"
                      onClick={() => {
                        deleteOtherAsset(o.id);
                        toast.success("Asset removed");
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{formatINR(value, { compact: true })}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
