"use client";

import * as React from "react";
import { LineChart, MoreHorizontal, Pencil, TrendingUp, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AddInvestmentDialog } from "@/components/add-investment-dialog";
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
  const totalInvested = holdings.reduce((s, h) => s + h.invested, 0);
  const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);
  const totalReturn = totalValue - totalInvested;
  const returnPct = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  const allocation = allocationByGroup(holdings).map((g) => ({ ...g, color: GROUP_COLORS[g.name] ?? "var(--chart-9)" }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Investments</h1>
          <p className="text-sm text-muted-foreground">Portfolio across equity, debt, gold and crypto</p>
        </div>
        <AddInvestmentDialog />
      </div>

      <Card className="py-5">
        <CardContent className="grid grid-cols-2 gap-6 px-5 sm:grid-cols-4 sm:px-6">
          <MetricCard label="Portfolio Value" value={formatINR(totalValue, { compact: true })} size="lg" />
          <MetricCard label="Invested" value={formatINR(totalInvested, { compact: true })} size="lg" />
          <MetricCard label="Total Returns" value={formatINR(totalReturn, { compact: true })} size="lg" />
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
              <div key={h.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{h.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {ASSET_CLASS_LABEL[h.assetClass]} · {h.quantity < 1 ? h.quantity.toFixed(4) : h.quantity.toLocaleString("en-IN")} units
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-medium tabular-nums">{formatINR(h.currentValue, { compact: true })}</p>
                  <p className={`text-xs tabular-nums ${h.gain >= 0 ? "text-positive" : "text-negative"}`}>
                    {h.gain >= 0 ? "+" : ""}
                    {formatINR(h.gain, { compact: true })} ({formatPercent(h.returnPct, 1)})
                  </p>
                </div>
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
                  <TableCell className="pl-4 font-medium">{h.name}</TableCell>
                  <TableCell className="text-muted-foreground">{ASSET_CLASS_LABEL[h.assetClass]}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {h.quantity < 1 ? h.quantity.toFixed(4) : h.quantity.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{formatINR(h.averageCost)}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{formatINR(h.currentPrice)}</TableCell>
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
  );
}
