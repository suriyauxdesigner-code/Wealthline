"use client";

import * as React from "react";
import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, History, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Reveal } from "cube-motion/react";

import { AddInvestmentDialog } from "@/components/add-investment-dialog";
import { LogInvestmentTransactionDialog } from "@/components/log-investment-transaction-dialog";
import { MobileAddInvestmentSheet } from "@/components/mobile/add-investment-sheet";
import { MobileLogInvestmentTransactionSheet } from "@/components/mobile/log-investment-transaction-sheet";
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
import { useAppStore } from "@/lib/store";
import { calcCurrentValue, calcInvestedValue, calcReturnPct, convertToINR, formatCurrency, formatINR, formatPercent } from "@/lib/calculations";
import { ASSET_CLASS_LABEL, isUnitBasedAssetClass } from "@/lib/investment-selectors";
import * as investmentTransactionsRepo from "@/lib/repositories/investment-transactions";
import type { InvestmentTransaction } from "@/lib/types";

type InvestmentTransactionType = InvestmentTransaction["type"];

const TX_TYPE_LABEL: Record<InvestmentTransactionType, string> = {
  buy: "Buy",
  sell: "Sell",
  dividend: "Dividend",
};

export default function InvestmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const investments = useAppStore((s) => s.investments);
  const accounts = useAppStore((s) => s.accounts);
  const dataLoaded = useAppStore((s) => s.dataLoaded);
  const usdInrRate = useAppStore((s) => s.usdInrRate);
  const deleteInvestment = useAppStore((s) => s.deleteInvestment);
  const deleteInvestmentTransactionEntry = useAppStore((s) => s.deleteInvestmentTransactionEntry);

  const investment = investments.find((i) => i.id === id);
  const [transactions, setTransactions] = React.useState<InvestmentTransaction[] | null>(null);
  const [editing, setEditing] = React.useState(false);
  const [editingTx, setEditingTx] = React.useState<InvestmentTransaction | null>(null);
  const [mobileEditing, setMobileEditing] = React.useState(false);
  const [mobileLogOpen, setMobileLogOpen] = React.useState(false);
  const [mobileEditingTx, setMobileEditingTx] = React.useState<InvestmentTransaction | null>(null);

  const refetchTransactions = React.useCallback(() => {
    investmentTransactionsRepo.listInvestmentTransactions(id).then(setTransactions);
  }, [id]);

  React.useEffect(() => {
    let cancelled = false;
    investmentTransactionsRepo.listInvestmentTransactions(id).then((rows) => {
      if (!cancelled) setTransactions(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!investment) {
    return (
      <div className="space-y-6">
        <Link href="/investments" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to investments
        </Link>
        <p className="wl-mobile text-[14px] font-medium text-wl-muted lg:hidden">
          {dataLoaded ? "This holding may have been deleted." : "Fetching this holding's details."}
        </p>
        <Card className="hidden lg:block">
          <CardContent>
            <EmptyState
              icon={History}
              title={dataLoaded ? "Investment not found" : "Loading…"}
              description={dataLoaded ? "This holding may have been deleted." : "Fetching this holding's details."}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const unitBased = isUnitBasedAssetClass(investment.assetClass);
  const invested = calcInvestedValue(investment.quantity, investment.averageCost);
  const currentValue = calcCurrentValue(investment.quantity, investment.currentPrice);
  const currentValueINR = convertToINR(currentValue, investment.currency, usdInrRate);
  const gain = currentValue - invested;
  const returnPct = calcReturnPct(invested, currentValue);
  // A holding created before per-transaction tracking (or whose opening
  // position was never logged) has a quantity with nothing behind it in
  // history — offer to back-fill it as the first Buy instead of leaving the
  // history tab silently empty next to a non-zero quantity.
  const openingBalance =
    transactions?.length === 0 && investment.quantity > 0
      ? { quantity: investment.quantity, price: investment.averageCost }
      : undefined;

  async function handleDeleteTransaction(txId: string) {
    if (!investment) return;
    await deleteInvestmentTransactionEntry(investment.id, txId);
    refetchTransactions();
    toast.success("Transaction removed");
  }

  return (
    <>
      <div className="wl-mobile -mx-4 -mt-5 min-h-svh bg-wl-canvas px-6 pt-3 pb-6 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link href="/investments" className="flex items-center gap-1.5 text-[14px] font-semibold text-wl-muted">
            <ArrowLeft className="size-4" /> Back
          </Link>
          <button onClick={() => setMobileEditing(true)} className="flex size-9 items-center justify-center rounded-lg bg-wl-surface">
            <Pencil className="size-4 text-wl-ink" />
          </button>
        </div>

        <p className="mt-3 text-[20px] font-semibold leading-7 tracking-[-0.8px] text-wl-ink">{investment.name}</p>
        <p className="text-[14px] font-medium leading-5 tracking-[-0.56px] text-wl-muted">
          {ASSET_CLASS_LABEL[investment.assetClass]} · {investment.accountId ? accounts.find((a) => a.id === investment.accountId)?.name : ""}
        </p>

        <p className="mt-3 text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-muted">Current value</p>
        <p className="text-[48px] font-semibold leading-[56px] tracking-[-3.84px] text-wl-ink">{formatCurrency(currentValue, investment.currency)}</p>
        {investment.currency !== "INR" && (
          <p className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">≈ {formatINR(currentValueINR)}</p>
        )}
        <p className={`text-[12px] font-medium leading-4 tracking-[-0.48px] ${gain >= 0 ? "text-wl-muted" : "text-wl-error"}`}>
          Total return {gain >= 0 ? "+" : "−"}
          {formatCurrency(Math.abs(gain), investment.currency)} ({formatPercent(returnPct, 1)})
        </p>

        <div className="mt-3 flex flex-col gap-3 rounded-lg bg-wl-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-medium leading-5 tracking-[-0.56px] text-wl-muted">Invested</span>
            <span className="text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-ink">{formatCurrency(invested, investment.currency)}</span>
          </div>
          {unitBased ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-medium leading-5 tracking-[-0.56px] text-wl-muted">Units held</span>
                <span className="text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-ink">
                  {investment.quantity < 1 ? investment.quantity.toFixed(4) : investment.quantity.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-medium leading-5 tracking-[-0.56px] text-wl-muted">Latest NAV</span>
                <span className="text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-ink">{formatCurrency(investment.currentPrice, investment.currency, { decimals: 4 })}</span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium leading-5 tracking-[-0.56px] text-wl-muted">Current value</span>
              <span className="text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-ink">{formatCurrency(currentValue, investment.currency)}</span>
            </div>
          )}
        </div>

        {unitBased ? (
          <>
            <button
              type="button"
              onClick={() => setMobileLogOpen(true)}
              className="mt-3 flex h-[52px] items-center justify-center rounded-lg bg-wl-accent text-[15px] font-semibold tracking-[-0.6px] text-white"
            >
              Log transaction
            </button>

            <p className="mt-6 text-[20px] font-semibold leading-7 tracking-[-0.8px] text-wl-ink">History</p>
            {!transactions ? (
              <p className="mt-3 text-[14px] font-medium text-wl-muted">Loading…</p>
            ) : transactions.length === 0 ? (
              <p className="mt-3 text-[14px] font-medium text-wl-muted">
                {openingBalance
                  ? `Shows ${openingBalance.quantity.toLocaleString("en-IN")} units — log that as your opening Buy to start tracking it.`
                  : "No transactions logged yet."}
              </p>
            ) : (
              <Reveal as="div" targets="children" className="mt-3 flex flex-col gap-1">
                {transactions.map((tx) => (
                  <button
                    key={tx.id}
                    onClick={() => setMobileEditingTx(tx)}
                    className="flex items-center justify-between border-b border-wl-border py-3 text-left last:border-b-0"
                  >
                    <div>
                      <p className="text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-ink">{TX_TYPE_LABEL[tx.type]}</p>
                      <p className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">
                        {new Date(tx.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        {tx.type !== "dividend" && ` · ${tx.quantity.toLocaleString("en-IN")} units · ${formatCurrency(tx.price, investment.currency, { decimals: 4 })}`}
                      </p>
                    </div>
                    <p className="text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-ink">{formatCurrency(tx.amount, investment.currency, { decimals: 2 })}</p>
                  </button>
                ))}
              </Reveal>
            )}
          </>
        ) : (
          <p className="mt-3 text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">
            {ASSET_CLASS_LABEL[investment.assetClass]} holdings track a lump invested amount and current value — use Edit to update it, or
            record a contribution from the Investments list.
          </p>
        )}
      </div>

      {mobileEditing && (
        <MobileAddInvestmentSheet open={mobileEditing} onOpenChange={setMobileEditing} editInvestment={investment} />
      )}
      {mobileLogOpen && (
        <MobileLogInvestmentTransactionSheet
          open={mobileLogOpen}
          onOpenChange={setMobileLogOpen}
          investment={investment}
          openingBalance={openingBalance}
          onLogged={refetchTransactions}
        />
      )}
      {mobileEditingTx && (
        <MobileLogInvestmentTransactionSheet
          open={!!mobileEditingTx}
          onOpenChange={(v) => !v && setMobileEditingTx(null)}
          investment={investment}
          editEntry={mobileEditingTx}
          onLogged={refetchTransactions}
        />
      )}

      <div className="hidden space-y-6 lg:block">
      <div className="flex items-center justify-between">
        <Link href="/investments" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to investments
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditing(true)}>
              <Pencil /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={async () => {
                await deleteInvestment(investment.id);
                toast.success("Investment removed");
                router.push("/investments");
              }}
            >
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{investment.name}</h1>
          <p className="text-sm text-muted-foreground">{ASSET_CLASS_LABEL[investment.assetClass]}</p>
        </div>
        {unitBased && (
          <LogInvestmentTransactionDialog
            investment={investment}
            onLogged={refetchTransactions}
            openingBalance={openingBalance}
          />
        )}
      </div>

      <Card className="py-5">
        <CardContent className="grid grid-cols-2 gap-6 px-5 sm:grid-cols-4 sm:px-6">
          <MetricCard
            label="Current value"
            value={formatCurrency(currentValue, investment.currency)}
            hint={investment.currency !== "INR" ? `≈ ${formatINR(currentValueINR)}` : undefined}
            size="lg"
          />
          <MetricCard label="Invested" value={formatCurrency(invested, investment.currency)} size="lg" />
          <MetricCard
            label="Total returns"
            value={`${gain >= 0 ? "+" : ""}${formatCurrency(gain, investment.currency)}`}
            changePct={returnPct}
            size="lg"
          />
          {unitBased ? (
            <MetricCard label="Units held" value={investment.quantity < 1 ? investment.quantity.toFixed(4) : investment.quantity.toLocaleString("en-IN")} size="lg" />
          ) : (
            <MetricCard label="Return" value={formatPercent(returnPct, 1)} size="lg" />
          )}
        </CardContent>
      </Card>

      {unitBased && (
        <Card className="py-5">
          <CardContent className="grid grid-cols-2 gap-6 px-5 sm:grid-cols-2 sm:px-6">
            <MetricCard label="Avg. cost / NAV" value={formatCurrency(investment.averageCost, investment.currency, { decimals: 4 })} />
            <MetricCard label="Current price / NAV" value={formatCurrency(investment.currentPrice, investment.currency, { decimals: 4 })} />
          </CardContent>
        </Card>
      )}

      {unitBased ? (
        <Card className="py-0">
          <CardHeader className="border-b border-border/70 py-4">
            <CardTitle className="text-sm font-medium">Transaction history</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {!transactions ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">Loading…</div>
            ) : transactions.length === 0 ? (
              <EmptyState
                icon={History}
                title={openingBalance ? "This holding has no logged history yet" : "No transactions logged yet"}
                description={
                  openingBalance
                    ? `It shows ${openingBalance.quantity.toLocaleString("en-IN")} units — log that as your opening Buy to start tracking it.`
                    : "Log your buys, sells, and dividends to build this holding's history."
                }
                action={
                  <LogInvestmentTransactionDialog
                    investment={investment}
                    onLogged={refetchTransactions}
                    openingBalance={openingBalance}
                  />
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="pl-4 text-muted-foreground">
                        {new Date(tx.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </TableCell>
                      <TableCell className="font-medium">{TX_TYPE_LABEL[tx.type]}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {tx.type === "dividend" ? "—" : tx.quantity.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {tx.type === "dividend" ? "—" : formatCurrency(tx.price, investment.currency, { decimals: 4 })}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium">
                        {formatCurrency(tx.amount, investment.currency, { decimals: 2 })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground"
                            onClick={() => setEditingTx(tx)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-negative"
                            onClick={() => handleDeleteTransaction(tx.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ) : (
        <p className="text-xs text-muted-foreground">
          {ASSET_CLASS_LABEL[investment.assetClass]} holdings track a lump invested amount and current value rather
          than unit-by-unit transactions — use Edit to update its current value over time.
        </p>
      )}

      {editing && (
        <AddInvestmentDialog
          trigger={null}
          editInvestment={investment}
          open={editing}
          onOpenChange={setEditing}
        />
      )}

      {editingTx && (
        <LogInvestmentTransactionDialog
          investment={investment}
          trigger={null}
          editEntry={editingTx}
          open={!!editingTx}
          onOpenChange={(v) => !v && setEditingTx(null)}
          onLogged={refetchTransactions}
        />
      )}
      </div>
    </>
  );
}
