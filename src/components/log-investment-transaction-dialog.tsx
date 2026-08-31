"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/date-picker";
import { useAppStore } from "@/lib/store";
import { formatINR } from "@/lib/calculations";
import type { Investment, InvestmentTransaction, InvestmentTransactionType } from "@/lib/types";

const TYPE_LABEL: Record<InvestmentTransactionType, string> = {
  buy: "Buy",
  sell: "Sell",
  dividend: "Dividend",
};

interface LogInvestmentTransactionDialogProps {
  investment: Investment;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Called after a transaction is successfully logged/updated — use to refetch the holding's history. */
  onLogged?: () => void;
  /**
   * Pre-fills the Buy fields with an existing quantity/avg cost that has no
   * logged history yet (a holding created before per-transaction tracking,
   * or one whose opening position hasn't been logged) — so the user can
   * back-fill it as their first transaction in one click instead of
   * re-typing numbers they already entered.
   */
  openingBalance?: { quantity: number; price: number };
  /** When set, the dialog edits this logged transaction instead of creating one. */
  editEntry?: InvestmentTransaction;
}

export function LogInvestmentTransactionDialog({
  investment,
  trigger,
  open: openProp,
  onOpenChange,
  onLogged,
  openingBalance,
  editEntry,
}: LogInvestmentTransactionDialogProps) {
  const isEdit = !!editEntry;
  const [openState, setOpenState] = React.useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChange ?? setOpenState;

  const logInvestmentTransaction = useAppStore((s) => s.logInvestmentTransaction);
  const updateInvestmentTransactionEntry = useAppStore((s) => s.updateInvestmentTransactionEntry);

  const [type, setType] = React.useState<InvestmentTransactionType>(editEntry?.type ?? "buy");
  const [quantity, setQuantity] = React.useState(
    editEntry ? String(editEntry.quantity) : openingBalance ? String(openingBalance.quantity) : ""
  );
  const [price, setPrice] = React.useState(
    editEntry
      ? String(editEntry.price)
      : openingBalance
        ? String(openingBalance.price)
        : investment.currentPrice
          ? String(investment.currentPrice)
          : ""
  );
  const [amount, setAmount] = React.useState(editEntry?.type === "dividend" ? String(editEntry.price) : "");
  const [date, setDate] = React.useState<Date>(editEntry ? new Date(editEntry.date) : new Date());
  const [submitting, setSubmitting] = React.useState(false);

  const isDividend = type === "dividend";
  const numericQuantity = Number(quantity);
  const numericPrice = Number(price);
  const value = numericQuantity && numericPrice ? numericQuantity * numericPrice : 0;

  function reset() {
    if (isEdit) return;
    setType("buy");
    setQuantity(openingBalance ? String(openingBalance.quantity) : "");
    setPrice(openingBalance ? String(openingBalance.price) : investment.currentPrice ? String(investment.currentPrice) : "");
    setAmount("");
    setDate(new Date());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input = isDividend
      ? { type, quantity: 1, price: Number(amount), date: date.toISOString().slice(0, 10) }
      : { type, quantity: numericQuantity, price: numericPrice, date: date.toISOString().slice(0, 10) };
    if (!input.quantity || !input.price) return;

    setSubmitting(true);
    try {
      if (isEdit) {
        await updateInvestmentTransactionEntry(investment.id, editEntry!.id, input);
        toast.success(`${TYPE_LABEL[type]} updated`, { description: investment.name });
      } else {
        await logInvestmentTransaction(investment.id, input);
        toast.success(`${TYPE_LABEL[type]} logged`, { description: investment.name });
      }
      reset();
      setOpen(false);
      onLogged?.();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      {trigger !== null && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button size="sm">
              <Plus /> Log transaction
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit transaction" : "Log transaction"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Update this logged transaction for ${investment.name}.`
              : openingBalance
                ? "Confirm your existing position to start this holding's history."
                : `Record a buy, sell, or dividend for ${investment.name}.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {openingBalance && !isEdit && (
            <p className="rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              We found {openingBalance.quantity.toLocaleString("en-IN")} units at {formatINR(openingBalance.price, { decimals: 4 })} avg.
              cost with no logged history — pre-filled below as your opening Buy.
            </p>
          )}
          <Tabs value={type} onValueChange={(v) => setType(v as InvestmentTransactionType)}>
            <TabsList className="grid w-full grid-cols-3">
              {(Object.keys(TYPE_LABEL) as InvestmentTransactionType[]).map((t) => (
                <TabsTrigger key={t} value={t}>
                  {TYPE_LABEL[t]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {isDividend ? (
            <div className="space-y-1.5">
              <Label htmlFor="tx-amount">Amount received</Label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                  ₹
                </span>
                <Input
                  id="tx-amount"
                  inputMode="decimal"
                  autoFocus
                  placeholder="0"
                  className="pl-6"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tx-quantity">Quantity / units</Label>
                <Input
                  id="tx-quantity"
                  inputMode="decimal"
                  autoFocus
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value.replace(/[^0-9.]/g, ""))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tx-price">Price / NAV</Label>
                <Input
                  id="tx-price"
                  inputMode="decimal"
                  placeholder="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Date</Label>
            <DatePicker date={date} onSelect={(d) => d && setDate(d)} />
          </div>

          {!isDividend && value > 0 && (
            <p className="text-xs text-muted-foreground">
              Total {type === "buy" ? "cost" : "proceeds"}: <span className="font-medium text-foreground">{formatINR(value, { decimals: 2 })}</span>
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : isEdit ? "Save changes" : "Log transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
