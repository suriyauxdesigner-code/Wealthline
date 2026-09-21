"use client";

import * as React from "react";
import { toast } from "sonner";

import { MobileBottomSheet } from "./bottom-sheet";
import { MobileDateField } from "./date-field";
import { MobileDiscardSheet, useDiscardGuard, useIsDirty } from "./discard-guard";
import { formatINR } from "@/lib/calculations";
import { useAppStore } from "@/lib/store";
import type { Investment, InvestmentTransaction, InvestmentTransactionType } from "@/lib/types";

const TYPE_LABEL: Record<InvestmentTransactionType, string> = { buy: "Buy", sell: "Sell", dividend: "Dividend" };

interface MobileLogInvestmentTransactionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investment: Investment;
  editEntry?: InvestmentTransaction;
  openingBalance?: { quantity: number; price: number };
  onLogged?: () => void;
}

export function MobileLogInvestmentTransactionSheet({
  open,
  onOpenChange,
  investment,
  editEntry,
  openingBalance,
  onLogged,
}: MobileLogInvestmentTransactionSheetProps) {
  const isEdit = !!editEntry;
  const logInvestmentTransaction = useAppStore((s) => s.logInvestmentTransaction);
  const updateInvestmentTransactionEntry = useAppStore((s) => s.updateInvestmentTransactionEntry);
  const deleteInvestmentTransactionEntry = useAppStore((s) => s.deleteInvestmentTransactionEntry);

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
  const [date, setDate] = React.useState(editEntry?.date ?? new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = React.useState(false);

  const isDividend = type === "dividend";
  const numericQuantity = Number(quantity);
  const numericPrice = Number(price);
  const value = numericQuantity && numericPrice ? numericQuantity * numericPrice : 0;

  const isDirty = useIsDirty({ type, quantity, price, amount, date });
  const { confirmOpen, requestClose, keepEditing, discardChanges } = useDiscardGuard(isDirty, () => onOpenChange(false));

  async function handleSubmit() {
    const input = isDividend
      ? { type, quantity: 1, price: Number(amount), date }
      : { type, quantity: numericQuantity, price: numericPrice, date };
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
      onOpenChange(false);
      onLogged?.();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!editEntry) return;
    await deleteInvestmentTransactionEntry(investment.id, editEntry.id);
    toast.success("Transaction removed");
    onOpenChange(false);
    onLogged?.();
  }

  return (
    <>
    <MobileBottomSheet open={open} onOpenChange={onOpenChange} onRequestClose={requestClose} title={isEdit ? "Edit transaction" : "Log transaction"}>
      <div className="flex flex-col gap-3">
        {openingBalance && !isEdit && (
          <p className="rounded-lg bg-wl-surface p-3 text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">
            We found {openingBalance.quantity.toLocaleString("en-IN")} units at {formatINR(openingBalance.price, { decimals: 4 })} avg. cost with
            no logged history — pre-filled below as your opening Buy.
          </p>
        )}
        <div className="flex gap-1 rounded-xl bg-wl-surface p-1">
          {(Object.keys(TYPE_LABEL) as InvestmentTransactionType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 rounded-lg py-3 text-[14px] font-semibold leading-5 tracking-[-0.56px] ${type === t ? "bg-wl-disabled text-wl-ink" : "text-wl-muted"}`}
            >
              {TYPE_LABEL[t]}
            </button>
          ))}
        </div>

        {isDividend ? (
          <div className="flex h-16 flex-col justify-center gap-1 border-b border-wl-border">
            <label className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Amount received</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0"
              inputMode="decimal"
              className="bg-transparent text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink placeholder:text-wl-muted focus:outline-none"
            />
          </div>
        ) : (
          <>
            <div className="flex h-16 flex-col justify-center gap-1 border-b border-wl-border">
              <label className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Quantity / units</label>
              <input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="0"
                inputMode="decimal"
                className="bg-transparent text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink placeholder:text-wl-muted focus:outline-none"
              />
            </div>
            <div className="flex h-16 flex-col justify-center gap-1 border-b border-wl-border">
              <label className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Price / NAV</label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="0"
                inputMode="decimal"
                className="bg-transparent text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink placeholder:text-wl-muted focus:outline-none"
              />
            </div>
          </>
        )}

        <MobileDateField label="Date" value={date} onChange={setDate} />

        {!isDividend && value > 0 && (
          <p className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">
            Total {type === "buy" ? "cost" : "proceeds"}: <span className="font-semibold text-wl-ink">{formatINR(value, { decimals: 2 })}</span>
          </p>
        )}

        <button
          type="button"
          disabled={submitting}
          onClick={handleSubmit}
          className="mt-1 flex h-[52px] items-center justify-center rounded-lg bg-wl-accent text-[15px] font-semibold tracking-[-0.6px] text-white disabled:opacity-60"
        >
          {submitting ? "Saving…" : isEdit ? "Save changes" : "Log transaction"}
        </button>
        {isEdit && (
          <button type="button" onClick={handleDelete} className="flex h-11 items-center justify-center text-[14px] font-semibold text-wl-error">
            Delete transaction
          </button>
        )}
      </div>
    </MobileBottomSheet>

    <MobileDiscardSheet open={confirmOpen} noun="transaction" onKeepEditing={keepEditing} onDiscard={discardChanges} />
    </>
  );
}
