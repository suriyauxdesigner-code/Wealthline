"use client";

import * as React from "react";
import { toast } from "sonner";

import { MobileBottomSheet } from "./bottom-sheet";
import { MobileKeypad } from "./keypad";
import { MobileFieldRow } from "./field-row";
import { MobileListPicker } from "./list-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { resolveIcon } from "@/components/finance/icon-map";
import { useAppStore } from "@/lib/store";
import { formatINR } from "@/lib/calculations";
import type { Transaction, TransactionType } from "@/lib/types";

type MobileTransactionType = Extract<TransactionType, "expense" | "income" | "transfer">;

const SHEET_TITLE: Record<MobileTransactionType, string> = {
  expense: "Add expense",
  income: "Add income",
  transfer: "Transfer money",
};

const EDIT_SHEET_TITLE: Record<MobileTransactionType, string> = {
  expense: "Edit expense",
  income: "Edit income",
  transfer: "Edit transfer",
};

const AMOUNT_TITLE: Record<MobileTransactionType, string> = {
  expense: "Expense amount",
  income: "Income amount",
  transfer: "Transfer amount",
};

const SAVE_LABEL: Record<MobileTransactionType, string> = {
  expense: "Save expense",
  income: "Save income",
  transfer: "Save transfer",
};

const TYPE_TO_CATEGORY_KIND: Record<MobileTransactionType, string> = {
  expense: "expense",
  income: "income",
  transfer: "transfer",
};

const FROM_ACCOUNT_LABEL: Record<MobileTransactionType, string> = {
  expense: "Paid from",
  income: "Received in",
  transfer: "From account",
};

type PickerTarget = "category" | "fromAccount" | "toAccount" | "debt";

function formatDateLabel(d: Date): string {
  const today = new Date();
  const rest = d.toLocaleDateString("en-IN", { day: "numeric", month: "long" });
  return d.toDateString() === today.toDateString() ? `Today, ${rest}` : rest;
}

interface MobileAddTransactionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: MobileTransactionType;
  editTransaction?: Transaction;
}

export function MobileAddTransactionSheet({
  open,
  onOpenChange,
  defaultType = "expense",
  editTransaction,
}: MobileAddTransactionSheetProps) {
  const isEdit = !!editTransaction;
  const type = (editTransaction?.type as MobileTransactionType | undefined) ?? defaultType;

  const accounts = useAppStore((s) => s.accounts);
  const categories = useAppStore((s) => s.categories);
  const liabilities = useAppStore((s) => s.liabilities);
  const addTransaction = useAppStore((s) => s.addTransaction);
  const updateTransaction = useAppStore((s) => s.updateTransaction);

  const [view, setView] = React.useState<"form" | "amount" | "picker">("form");
  const [pickerTarget, setPickerTarget] = React.useState<PickerTarget | null>(null);

  const [amount, setAmount] = React.useState(editTransaction ? String(editTransaction.amount) : "");
  const [merchant, setMerchant] = React.useState(editTransaction?.merchant ?? "");
  const [categoryId, setCategoryId] = React.useState(editTransaction?.categoryId ?? "");
  const [accountId, setAccountId] = React.useState(editTransaction?.accountId ?? accounts[0]?.id ?? "");
  const [toAccountId, setToAccountId] = React.useState(editTransaction?.toAccountId ?? "");
  const [liabilityId, setLiabilityId] = React.useState(editTransaction?.liabilityId ?? "");
  const [date, setDate] = React.useState<Date>(editTransaction ? new Date(editTransaction.date) : new Date());
  const [notes, setNotes] = React.useState(editTransaction?.notes ?? "");
  const [tags, setTags] = React.useState(editTransaction?.tags?.join(", ") ?? "");
  const [recurring, setRecurring] = React.useState(false);
  const [moreOpen, setMoreOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const relevantCategories = categories.filter((c) => c.kind === TYPE_TO_CATEGORY_KIND[type]);
  const showDebtField = type === "expense" || type === "transfer";

  function openPicker(target: PickerTarget) {
    setPickerTarget(target);
    setView("picker");
  }

  function handleKey(key: string) {
    if (key === "backspace") {
      setAmount((a) => a.slice(0, -1));
      return;
    }
    if (key === "." && amount.includes(".")) return;
    setAmount((a) => a + key);
  }

  async function handleSubmit() {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0 || !merchant || !accountId) return;
    if (type === "transfer" && !toAccountId) return;

    const fallbackCategory = relevantCategories[0]?.id ?? categories[0]?.id ?? "";
    const payload = {
      type: type as TransactionType,
      amount: numericAmount,
      merchant,
      categoryId: categoryId || fallbackCategory,
      accountId,
      toAccountId: type === "transfer" ? toAccountId || undefined : undefined,
      liabilityId: showDebtField ? liabilityId || undefined : undefined,
      date: date.toISOString().slice(0, 10),
      notes: notes || undefined,
      tags: tags
        ? tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined,
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await updateTransaction(editTransaction!.id, payload);
        toast.success("Transaction updated", { description: merchant });
      } else {
        await addTransaction(payload);
        toast.success(`${type[0].toUpperCase()}${type.slice(1)} added`, { description: merchant });
      }
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  const pickerConfig = (() => {
    if (pickerTarget === "category") {
      return {
        title: `${type[0].toUpperCase()}${type.slice(1)} category`,
        options: relevantCategories.map((c) => ({
          id: c.id,
          label: c.name,
          icon: React.createElement(resolveIcon(c.icon), { className: "size-6 text-wl-ink", strokeWidth: 1.75 }),
        })),
        selectedId: categoryId,
        onSelect: (id: string) => {
          setCategoryId(id);
          setView("form");
        },
      };
    }
    if (pickerTarget === "fromAccount") {
      return {
        title: FROM_ACCOUNT_LABEL[type],
        options: accounts.map((a) => ({ id: a.id, label: a.name })),
        selectedId: accountId,
        onSelect: (id: string) => {
          setAccountId(id);
          setView("form");
        },
      };
    }
    if (pickerTarget === "toAccount") {
      return {
        title: "To account",
        options: accounts.filter((a) => a.id !== accountId).map((a) => ({ id: a.id, label: a.name })),
        selectedId: toAccountId,
        onSelect: (id: string) => {
          setToAccountId(id);
          setView("form");
        },
      };
    }
    if (pickerTarget === "debt") {
      return {
        title: "Pay toward a debt",
        options: [{ id: "", label: "None" }, ...liabilities.map((l) => ({ id: l.id, label: l.name }))],
        selectedId: liabilityId,
        onSelect: (id: string) => {
          setLiabilityId(id);
          setView("form");
        },
      };
    }
    return null;
  })();

  const title = view === "amount" ? AMOUNT_TITLE[type] : view === "picker" ? pickerConfig?.title ?? "" : isEdit ? EDIT_SHEET_TITLE[type] : SHEET_TITLE[type];

  return (
    <MobileBottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
    >
      {view === "amount" && (
        <div className="flex flex-col gap-3">
          <p className="text-[64px] font-semibold leading-[72px] tracking-[-3.84px] text-wl-ink">{formatINR(Number(amount) || 0)}</p>
          <p className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">INR · Indian rupee</p>
          <MobileKeypad onKeyPress={handleKey} />
          <button
            type="button"
            onClick={() => setView("form")}
            className="flex h-[52px] items-center justify-center rounded-lg bg-wl-accent text-[15px] font-semibold tracking-[-0.6px] text-white"
          >
            Done
          </button>
        </div>
      )}

      {view === "picker" && pickerConfig && (
        <MobileListPicker options={pickerConfig.options} selectedId={pickerConfig.selectedId} onSelect={pickerConfig.onSelect} />
      )}

      {view === "form" && (
        <div className="flex flex-col gap-3">
          <button type="button" onClick={() => setView("amount")} className="flex flex-col items-start gap-1 text-left">
            <span className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Amount · INR</span>
            <span className="text-[48px] font-semibold leading-[56px] tracking-[-3.84px] text-wl-ink">{formatINR(Number(amount) || 0)}</span>
          </button>

          <div className="flex flex-col">
            <div className="flex h-16 flex-col justify-center gap-1 border-b border-wl-border">
              <label className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">
                {type === "income" ? "Source" : "Merchant / description"}
              </label>
              <input
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder={type === "income" ? "e.g. Salary" : "e.g. Swiggy"}
                className="bg-transparent text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink placeholder:text-wl-muted focus:outline-none"
              />
            </div>

            {type !== "transfer" && (
              <MobileFieldRow
                label="Category"
                value={categories.find((c) => c.id === categoryId)?.name ?? relevantCategories[0]?.name ?? "Select"}
                onClick={() => openPicker("category")}
              />
            )}

            <MobileFieldRow
              label={FROM_ACCOUNT_LABEL[type]}
              value={accounts.find((a) => a.id === accountId)?.name ?? "Select"}
              onClick={() => openPicker("fromAccount")}
            />

            {type === "transfer" && (
              <MobileFieldRow
                label="To account"
                value={accounts.find((a) => a.id === toAccountId)?.name ?? "Select"}
                onClick={() => openPicker("toAccount")}
              />
            )}

            <Popover>
              <PopoverTrigger asChild>
                <button type="button" className="flex h-16 w-full items-center justify-between border-b border-wl-border text-left last:border-b-0">
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Date</span>
                    <span className="text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink">{formatDateLabel(date)}</span>
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} />
              </PopoverContent>
            </Popover>

            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              className="flex h-14 w-full items-center justify-between text-left"
            >
              <div className="flex flex-col">
                <span className="text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-ink">More details</span>
                {!moreOpen && (
                  <span className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">
                    Notes, tags{showDebtField ? ", recurring or debt payment" : " or recurring"}
                  </span>
                )}
              </div>
              <span className="text-[18px] text-wl-muted">{moreOpen ? "−" : "+"}</span>
            </button>

            {moreOpen && (
              <div className="flex flex-col gap-3 pb-1">
                <div className="flex h-16 flex-col justify-center gap-1 border-b border-wl-border">
                  <label className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Notes</label>
                  <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add a note…"
                    className="bg-transparent text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink placeholder:text-wl-muted focus:outline-none"
                  />
                </div>
                <div className="flex h-16 flex-col justify-center gap-1 border-b border-wl-border">
                  <label className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Tags</label>
                  <input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="comma, separated"
                    className="bg-transparent text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink placeholder:text-wl-muted focus:outline-none"
                  />
                </div>
                {showDebtField && liabilities.length > 0 && (
                  <MobileFieldRow
                    label="Pay toward a debt"
                    value={liabilities.find((l) => l.id === liabilityId)?.name ?? "None"}
                    onClick={() => openPicker("debt")}
                  />
                )}
                {!isEdit && (
                  <div className="flex h-14 items-center justify-between border-b border-wl-border last:border-b-0">
                    <span className="text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-ink">Repeat monthly</span>
                    <Switch checked={recurring} onCheckedChange={setRecurring} />
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="flex h-[52px] items-center justify-center rounded-lg bg-wl-accent text-[15px] font-semibold tracking-[-0.6px] text-white disabled:opacity-60"
          >
            {submitting ? "Saving…" : isEdit ? "Save changes" : SAVE_LABEL[type]}
          </button>
        </div>
      )}
    </MobileBottomSheet>
  );
}
