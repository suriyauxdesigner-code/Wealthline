"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, LineChart, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AddOtherAssetDialog } from "@/components/add-other-asset-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/finance/empty-state";
import { MetricCard } from "@/components/finance/metric-card";
import { useAppStore } from "@/lib/store";
import { formatINR } from "@/lib/calculations";
import { calcNetWorthBreakdown } from "@/lib/net-worth-selectors";
import type { OtherAsset } from "@/lib/types";

const LIABILITY_LABEL: Record<string, string> = {
  credit_card: "Credit cards",
  personal_loan: "Personal loans",
  vehicle_loan: "Vehicle loans",
  home_loan: "Home loans",
  education_loan: "Education loans",
  other: "Other debt",
};

export default function NetWorthPage() {
  const { accounts, liabilities, otherAssets, deleteOtherAsset } = useAppStore();
  const [editingAsset, setEditingAsset] = React.useState<OtherAsset | null>(null);

  const breakdown = calcNetWorthBreakdown(accounts, liabilities, otherAssets);
  const assetRows = [
    { label: "Cash", value: breakdown.cash },
    { label: "Bank accounts", value: breakdown.bank },
    { label: "Investments", value: breakdown.investments },
    { label: "Vehicles", value: breakdown.vehicles },
    { label: "Property", value: breakdown.property },
    { label: "Other assets", value: breakdown.otherAssetsTotal },
  ].filter((r) => r.value > 0);

  const liabilityTotals = new Map<string, number>();
  for (const l of liabilities) {
    liabilityTotals.set(l.type, (liabilityTotals.get(l.type) ?? 0) + l.outstanding);
  }
  const liabilityRows = Array.from(liabilityTotals.entries()).map(([type, value]) => ({
    label: LIABILITY_LABEL[type] ?? type,
    value,
  }));

  return (
    <>
      <div className="wl-mobile -mx-4 -mt-5 min-h-svh bg-wl-canvas px-6 pt-3 pb-6 lg:hidden">
        <p className="text-[28px] font-semibold leading-9 tracking-[-1.12px] text-wl-ink">Net worth</p>
        <p className="mt-3 text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-muted">Your net worth</p>
        <p className={`text-[48px] font-semibold leading-[56px] tracking-[-3.84px] ${breakdown.netWorth < 0 ? "text-wl-error" : "text-wl-ink"}`}>
          {breakdown.netWorth < 0 ? "−" : ""}
          {formatINR(Math.abs(breakdown.netWorth))}
        </p>
        <p className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Assets minus outstanding debt</p>

        <div className="mt-3 flex flex-col gap-3 rounded-lg bg-wl-surface p-4">
          <p className="text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-ink">Assets</p>
          {assetRows.map((r) => (
            <div key={r.label} className="flex items-center justify-between">
              <span className="text-[14px] font-medium leading-5 tracking-[-0.56px] text-wl-muted">{r.label}</span>
              <span className="text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-ink">{formatINR(r.value)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-wl-border pt-3">
            <span className="text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-ink">Total assets</span>
            <span className="text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-ink">{formatINR(breakdown.totalAssets)}</span>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-3 rounded-lg bg-wl-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-ink">Liabilities</span>
            <span className="text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-ink">{formatINR(breakdown.totalLiabilities)}</span>
          </div>
          <Link href="/debts" className="text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-accent-text">
            View debts →
          </Link>
        </div>

        <div className="mt-3 flex flex-col gap-1 rounded-lg bg-wl-surface p-4">
          <p className="text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-ink">Your history starts here</p>
          <p className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">
            Monthly snapshots will show how your net worth changes over time.
          </p>
        </div>
      </div>

      <div className="hidden space-y-6 lg:block">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Net Worth</h1>
        <p className="text-sm text-muted-foreground">Assets − Liabilities = Net Worth</p>
      </div>

      <Card className="py-5">
        <CardContent className="grid grid-cols-3 gap-6 px-5 sm:px-6">
          <MetricCard label="Net Worth" value={formatINR(breakdown.netWorth, { compact: true })} size="lg" />
          <MetricCard label="Total assets" value={formatINR(breakdown.totalAssets, { compact: true })} size="lg" />
          <MetricCard label="Total liabilities" value={formatINR(breakdown.totalLiabilities, { compact: true })} size="lg" />
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
            description="Net worth trends need more than one snapshot — check back after using Wealthline for a while."
            className="py-20"
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Assets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {assetRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No assets yet — add an account or asset to see it here.</p>
            ) : (
              assetRows.map((r) => (
                <Row key={r.label} label={r.label} value={r.value} total={breakdown.totalAssets} color="var(--positive)" />
              ))
            )}
            <div className="flex items-center justify-between border-t border-border/70 pt-3 text-sm font-semibold">
              <span>Total assets</span>
              <span className="tabular-nums">{formatINR(breakdown.totalAssets)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Liabilities</CardTitle>
            <Link href="/debts" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              Manage debts <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {liabilityRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No liabilities yet — nothing counting against your net worth.</p>
            ) : (
              liabilityRows.map((r) => (
                <Row key={r.label} label={r.label} value={r.value} total={breakdown.totalLiabilities} color="var(--negative)" />
              ))
            )}
            <div className="flex items-center justify-between border-t border-border/70 pt-3 text-sm font-semibold">
              <span>Total liabilities</span>
              <span className="tabular-nums">{formatINR(breakdown.totalLiabilities)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

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
                    className="size-7 text-muted-foreground"
                    onClick={() => setEditingAsset(o)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
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

      {editingAsset && (
        <AddOtherAssetDialog
          trigger={null}
          editAsset={editingAsset}
          open={!!editingAsset}
          onOpenChange={(v) => !v && setEditingAsset(null)}
        />
      )}
      </div>
    </>
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
