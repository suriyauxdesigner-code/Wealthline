"use client";

import * as React from "react";
import Link from "next/link";
import { LineChart, MoreHorizontal, Pencil, Plus, TrendingUp, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AddInvestmentDialog } from "@/components/add-investment-dialog";
import { MobileAddInvestmentSheet } from "@/components/mobile/add-investment-sheet";
import { MobileInvestmentContributionSheet } from "@/components/mobile/investment-contribution-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/finance/empty-state";
import { MetricCard } from "@/components/finance/metric-card";
import { AllocationDonut } from "@/components/finance/allocation-donut";
import { useAppStore } from "@/lib/store";
import { formatINR, formatPercent } from "@/lib/calculations";
import { allocationByGroup, ASSET_CLASS_LABEL, holdingsWithReturns } from "@/lib/investment-selectors";

const GROUP_COLORS: Record<string, string> = {
  Equity: "var(--chart-1)",
  Debt: "var(--chart-6)",
  Gold: "var(--chart-3)",
  Crypto: "var(--chart-5)",
};

export default function InvestmentsPage() {
  const { investments, deleteInvestment } = useAppStore();
  const holdings = holdingsWithReturns(investments);
  const [editing, setEditing] = React.useState<(typeof holdings)[number] | null>(null);
  const [mobileCreateOpen, setMobileCreateOpen] = React.useState(false);
  const [mobileContributeOpen, setMobileContributeOpen] = React.useState(false);
  const totalInvested = holdings.reduce((s, h) => s + h.invested, 0);
  const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);
  const totalReturn = totalValue - totalInvested;
  const returnPct = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  const allocation = allocationByGroup(holdings).map((g) => ({ ...g, color: GROUP_COLORS[g.name] ?? "var(--chart-9)" }));

  return (
    <>
      <div className="wl-mobile -mx-4 -mt-5 min-h-svh bg-wl-canvas px-6 pt-3 pb-6 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[28px] font-semibold leading-9 tracking-[-1.12px] text-wl-ink">Investments</p>
          <button onClick={() => setMobileCreateOpen(true)} className="flex size-11 items-center justify-center rounded-lg bg-wl-surface">
            <Plus className="size-[22px] text-wl-ink" strokeWidth={1.75} />
          </button>
        </div>

        {holdings.length === 0 ? (
          <p className="mt-6 text-center text-[14px] font-medium text-wl-muted">No investments yet — tap + to add a holding.</p>
        ) : (
          <>
            <p className="mt-3 text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-muted">Portfolio value</p>
            <p className="text-[48px] font-semibold leading-[56px] tracking-[-3.84px] text-wl-ink">{formatINR(totalValue)}</p>
            <p className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Updated just now</p>
            <div className="mt-3 flex items-center justify-between rounded-lg bg-wl-surface p-4">
              <span className="text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-ink">Amount invested</span>
              <span className={`text-[14px] font-semibold leading-5 tracking-[-0.56px] ${totalReturn >= 0 ? "text-wl-ink" : "text-wl-error"}`}>
                {formatINR(totalInvested)}
                {totalReturn !== 0 && ` (${totalReturn >= 0 ? "+" : "−"}${formatPercent(Math.abs(returnPct), 1)})`}
              </span>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-[20px] font-semibold leading-7 tracking-[-0.8px] text-wl-ink">Holdings</p>
              <span className="text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-muted">{holdings.length} assets</span>
            </div>
            <div className="mt-3 flex flex-col gap-3">
              {holdings.map((h) => (
                <Link key={h.id} href={`/investments/${h.id}`} className="flex items-center justify-between rounded-lg bg-wl-surface p-4">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-ink">{h.name}</p>
                    <p className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">{ASSET_CLASS_LABEL[h.assetClass]}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-ink">{formatINR(h.currentValue)}</p>
                    <p className={`text-[12px] font-medium leading-4 tracking-[-0.48px] ${h.gain >= 0 ? "text-wl-ink" : "text-wl-error"}`}>
                      {h.gain >= 0 ? "+" : "−"}
                      {formatINR(Math.abs(h.gain))} ({formatPercent(h.returnPct, 1)})
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setMobileContributeOpen(true)}
              className="mt-3 flex h-[52px] items-center justify-center rounded-lg bg-wl-accent text-[15px] font-semibold tracking-[-0.6px] text-white"
            >
              Record contribution
            </button>
            <p className="mt-3 text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Values are based on your latest recorded prices.</p>
          </>
        )}
      </div>

      {mobileCreateOpen && <MobileAddInvestmentSheet open={mobileCreateOpen} onOpenChange={setMobileCreateOpen} />}
      {mobileContributeOpen && <MobileInvestmentContributionSheet open={mobileContributeOpen} onOpenChange={setMobileContributeOpen} />}

      <div className="hidden space-y-6 lg:block">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Investments</h1>
          <p className="text-sm text-muted-foreground">Portfolio across equity, debt, gold and crypto</p>
        </div>
        <AddInvestmentDialog />
      </div>

      <Card className="py-5">
        <CardContent className="grid grid-cols-2 gap-6 px-5 sm:grid-cols-4 sm:px-6">
          <MetricCard label="Portfolio Value" value={formatINR(totalValue)} size="lg" />
          <MetricCard label="Invested" value={formatINR(totalInvested)} size="lg" />
          <MetricCard label="Total Returns" value={formatINR(totalReturn)} size="lg" />
          <MetricCard label="Return" value={formatPercent(returnPct, 1)} size="lg" />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Portfolio value over time</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={LineChart}
              title="History will build up over time"
              description="Portfolio trends need more than one snapshot — check back after using Wealthline for a while."
              className="py-16"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Asset allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <AllocationDonut data={allocation} centerLabel="Total" centerValue={formatINR(totalValue, { compact: true })} size={160} />
          </CardContent>
        </Card>
      </div>

      <Card className="py-0">
        <CardHeader className="border-b border-border/70 py-4">
          <CardTitle className="text-sm font-medium">Holdings</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {holdings.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No investments yet"
              description="Add a holding to start tracking your portfolio."
              action={<AddInvestmentDialog />}
            />
          ) : (
            <>
          {/* Mobile: compact card list — an 8-column table doesn't fit small screens */}
          <div className="divide-y divide-border/70 md:hidden">
            {holdings.map((h) => (
              <div key={h.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50">
                <Link href={`/investments/${h.id}`} className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{h.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {ASSET_CLASS_LABEL[h.assetClass]} · {h.quantity < 1 ? h.quantity.toFixed(4) : h.quantity.toLocaleString("en-IN")} units
                  </p>
                </Link>
                <Link href={`/investments/${h.id}`} className="shrink-0 text-right">
                  <p className="text-sm font-medium tabular-nums">{formatINR(h.currentValue, { compact: true })}</p>
                  <p className={`text-xs tabular-nums ${h.gain >= 0 ? "text-positive" : "text-negative"}`}>
                    {h.gain >= 0 ? "+" : ""}
                    {formatINR(h.gain, { compact: true })} ({formatPercent(h.returnPct, 1)})
                  </p>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-7 shrink-0">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditing(h)}>
                      <Pencil /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => {
                        deleteInvestment(h.id);
                        toast.success("Investment removed");
                      }}
                    >
                      <Trash2 /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>

          <Table wrapperClassName="hidden md:block">
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Name</TableHead>
                <TableHead>Asset class</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Avg. cost</TableHead>
                <TableHead className="text-right">LTP</TableHead>
                <TableHead className="text-right">Current value</TableHead>
                <TableHead className="text-right">Gain / Loss</TableHead>
                <TableHead className="text-right">Return</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {holdings.map((h) => (
                <TableRow key={h.id}>
                  <TableCell className="pl-4 font-medium">
                    <Link href={`/investments/${h.id}`} className="hover:underline">
                      {h.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{ASSET_CLASS_LABEL[h.assetClass]}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {h.quantity < 1 ? h.quantity.toFixed(4) : h.quantity.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{formatINR(h.averageCost, { decimals: 4 })}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{formatINR(h.currentPrice, { decimals: 4 })}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{formatINR(h.currentValue, { compact: true })}</TableCell>
                  <TableCell className={`text-right tabular-nums ${h.gain >= 0 ? "text-positive" : "text-negative"}`}>
                    {h.gain >= 0 ? "+" : ""}
                    {formatINR(h.gain, { compact: true })}
                  </TableCell>
                  <TableCell className={`text-right tabular-nums font-medium ${h.returnPct >= 0 ? "text-positive" : "text-negative"}`}>
                    {formatPercent(h.returnPct, 1)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-7">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditing(h)}>
                          <Pencil /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            deleteInvestment(h.id);
                            toast.success("Investment removed");
                          }}
                        >
                          <Trash2 /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            </>
          )}
        </CardContent>
      </Card>

      {editing && (
        <AddInvestmentDialog
          trigger={null}
          editInvestment={editing}
          open={!!editing}
          onOpenChange={(v) => !v && setEditing(null)}
        />
      )}
      </div>
    </>
  );
}
