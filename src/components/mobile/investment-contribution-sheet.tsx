"use client";

import * as React from "react";
import { toast } from "sonner";

import { MobileBottomSheet } from "./bottom-sheet";
import { MobileFieldRow } from "./field-row";
import { MobileListPicker } from "./list-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { formatINR } from "@/lib/calculations";
import { isUnitBasedAssetClass } from "@/lib/investment-selectors";
import { useAppStore } from "@/lib/store";

interface MobileInvestmentContributionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Value-based holdings (FD/EPF/PPF/Bonds) don't have unit-level Buy/Sell —
// a contribution just adds to the invested amount, via a normal "investment"
// transaction linked to the holding (see store.ts's applyTransactionEffects,
// same mechanism as the desktop Add Transaction dialog's Investment tab).
export function MobileInvestmentContributionSheet({ open, onOpenChange }: MobileInvestmentContributionSheetProps) {
  const investments = useAppStore((s) => s.investments);
  const accounts = useAppStore((s) => s.accounts);
  const categories = useAppStore((s) => s.categories);
  const addTransaction = useAppStore((s) => s.addTransaction);

  const valueBasedHoldings = investments.filter((i) => !isUnitBasedAssetClass(i.assetClass));

  const [view, setView] = React.useState<"form" | "holding" | "sourceAccount" | "investmentAccount">("form");
  const [amount, setAmount] = React.useState("");
  const [investmentId, setInvestmentId] = React.useState(valueBasedHoldings[0]?.id ?? "");
  const [description, setDescription] = React.useState("Monthly contribution");
  const [sourceAccountId, setSourceAccountId] = React.useState(accounts[0]?.id ?? "");
  const [investmentAccountId, setInvestmentAccountId] = React.useState(valueBasedHoldings[0]?.accountId ?? "");
  const [date, setDate] = React.useState<Date>(new Date());
  const [notes, setNotes] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [moreOpen, setMoreOpen] = React.useState(false);

  const selectedHolding = investments.find((i) => i.id === investmentId);

  function selectHolding(id: string) {
    setInvestmentId(id);
    const holding = investments.find((i) => i.id === id);
    if (holding) setInvestmentAccountId(holding.accountId);
    setView("form");
  }

  async function handleSubmit() {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0 || !investmentId || !sourceAccountId) return;

    const fallbackCategory = categories.find((c) => c.kind === "investment")?.id ?? categories[0]?.id ?? "";
    setSubmitting(true);
    try {
      await addTransaction({
        type: "investment",
        amount: numericAmount,
        merchant: description || selectedHolding?.name || "Contribution",
        categoryId: fallbackCategory,
        accountId: sourceAccountId,
        toAccountId: investmentAccountId || undefined,
        investmentId,
        date: date.toISOString().slice(0, 10),
        notes: notes || undefined,
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
      });
      toast.success("Contribution saved", { description: selectedHolding?.name });
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  const title = view === "holding" ? "Holding" : view === "sourceAccount" ? "Source account" : view === "investmentAccount" ? "Investment account" : "Investment contribution";

  return (
    <MobileBottomSheet open={open} onOpenChange={onOpenChange} title={title}>
      {view === "holding" ? (
        <MobileListPicker options={valueBasedHoldings.map((h) => ({ id: h.id, label: h.name }))} selectedId={investmentId} onSelect={selectHolding} />
      ) : view === "sourceAccount" ? (
        <MobileListPicker
          options={accounts.map((a) => ({ id: a.id, label: a.name }))}
          selectedId={sourceAccountId}
          onSelect={(id) => {
            setSourceAccountId(id);
            setView("form");
          }}
        />
      ) : view === "investmentAccount" ? (
        <MobileListPicker
          options={accounts.map((a) => ({ id: a.id, label: a.name }))}
          selectedId={investmentAccountId}
          onSelect={(id) => {
            setInvestmentAccountId(id);
            setView("form");
          }}
        />
      ) : valueBasedHoldings.length === 0 ? (
        <p className="text-[14px] font-medium leading-5 text-wl-muted">
          Add an FD, EPF, PPF, or Bonds holding first — contributions apply to those.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-[48px] font-semibold leading-[56px] tracking-[-3.84px] text-wl-ink">{formatINR(Number(amount) || 0)}</p>
          <div className="flex h-16 flex-col justify-center gap-1 border-b border-wl-border">
            <label className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Amount</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="0"
              inputMode="numeric"
              className="bg-transparent text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink placeholder:text-wl-muted focus:outline-none"
            />
          </div>

          <MobileFieldRow label="Holding" value={selectedHolding?.name ?? "Select"} onClick={() => setView("holding")} />
          <div className="flex h-16 flex-col justify-center gap-1 border-b border-wl-border">
            <label className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-transparent text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink placeholder:text-wl-muted focus:outline-none"
            />
          </div>
          <MobileFieldRow label="Source account" value={accounts.find((a) => a.id === sourceAccountId)?.name ?? "Select"} onClick={() => setView("sourceAccount")} />
          <MobileFieldRow label="Investment account" value={accounts.find((a) => a.id === investmentAccountId)?.name ?? "Select"} onClick={() => setView("investmentAccount")} />

          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className="flex h-16 w-full items-center justify-between border-b border-wl-border text-left">
                <div className="flex flex-col gap-1">
                  <span className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Date</span>
                  <span className="text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink">
                    {date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} />
            </PopoverContent>
          </Popover>

          <button type="button" onClick={() => setMoreOpen((v) => !v)} className="flex h-14 w-full items-center justify-between text-left">
            <span className="text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-ink">More details</span>
            <span className="text-[18px] text-wl-muted">{moreOpen ? "−" : "+"}</span>
          </button>
          {moreOpen && (
            <>
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
            </>
          )}

          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="mt-1 flex h-[52px] items-center justify-center rounded-lg bg-wl-accent text-[15px] font-semibold tracking-[-0.6px] text-white disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save contribution"}
          </button>
        </div>
      )}
    </MobileBottomSheet>
  );
}
