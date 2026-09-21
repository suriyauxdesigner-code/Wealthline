"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { MobileBottomSheet } from "./bottom-sheet";
import { MobileFieldRow } from "./field-row";
import { MobileListPicker } from "./list-picker";
import { ASSET_CLASS_LABEL, isUnitBasedAssetClass } from "@/lib/investment-selectors";
import { useAppStore } from "@/lib/store";
import type { AssetClass, Investment } from "@/lib/types";

const ASSET_CLASSES = Object.keys(ASSET_CLASS_LABEL) as AssetClass[];

interface MobileAddInvestmentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editInvestment?: Investment;
}

export function MobileAddInvestmentSheet({ open, onOpenChange, editInvestment }: MobileAddInvestmentSheetProps) {
  const isEdit = !!editInvestment;
  const router = useRouter();
  const accounts = useAppStore((s) => s.accounts);
  const addInvestment = useAppStore((s) => s.addInvestment);
  const updateInvestment = useAppStore((s) => s.updateInvestment);
  const deleteInvestment = useAppStore((s) => s.deleteInvestment);

  const [view, setView] = React.useState<"form" | "assetClass" | "account">("form");
  const [name, setName] = React.useState(editInvestment?.name ?? "");
  const [assetClass, setAssetClass] = React.useState<AssetClass>(editInvestment?.assetClass ?? "equity");
  const [accountId, setAccountId] = React.useState(editInvestment?.accountId ?? accounts[0]?.id ?? "");
  const [currentPrice, setCurrentPrice] = React.useState(editInvestment ? String(editInvestment.currentPrice) : "");
  const [investedAmount, setInvestedAmount] = React.useState(
    editInvestment ? String(editInvestment.quantity * editInvestment.averageCost) : ""
  );
  const [currentValue, setCurrentValue] = React.useState(
    editInvestment ? String(editInvestment.quantity * editInvestment.currentPrice) : ""
  );
  const [submitting, setSubmitting] = React.useState(false);

  const unitBased = isUnitBasedAssetClass(assetClass);
  const selectedAccountId = accountId || accounts[0]?.id || "";

  async function handleSubmit() {
    if (!name || !selectedAccountId) return;

    setSubmitting(true);
    try {
      if (unitBased) {
        if (isEdit) {
          const numericCurrentPrice = Number(currentPrice);
          await updateInvestment(editInvestment!.id, {
            name,
            assetClass,
            accountId: selectedAccountId,
            currentPrice: numericCurrentPrice || editInvestment!.currentPrice,
          });
          toast.success("Investment updated", { description: name });
          onOpenChange(false);
        } else {
          const created = await addInvestment({
            name,
            assetClass,
            accountId: selectedAccountId,
            quantity: 0,
            averageCost: 0,
            currentPrice: 0,
          });
          onOpenChange(false);
          if (created) {
            toast.success("Investment added", { description: "Now log its units to build a history." });
            router.push(`/investments/${created.id}`);
          }
        }
      } else {
        const numericInvested = Number(investedAmount);
        const numericCurrent = currentValue === "" ? numericInvested : Number(currentValue);
        if (!numericInvested || numericInvested <= 0 || Number.isNaN(numericCurrent) || numericCurrent < 0) return;
        const payload = {
          name,
          assetClass,
          accountId: selectedAccountId,
          quantity: 1,
          averageCost: numericInvested,
          currentPrice: numericCurrent,
        };
        if (isEdit) {
          await updateInvestment(editInvestment!.id, payload);
          toast.success("Investment updated", { description: name });
        } else {
          await addInvestment(payload);
          toast.success("Investment added", { description: name });
        }
        onOpenChange(false);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!editInvestment) return;
    await deleteInvestment(editInvestment.id);
    toast.success("Investment removed");
    onOpenChange(false);
    router.push("/investments");
  }

  const title = view === "assetClass" ? "Asset class" : view === "account" ? "Account" : isEdit ? "Edit investment" : "Add investment";

  return (
    <MobileBottomSheet open={open} onOpenChange={onOpenChange} title={title}>
      {view === "assetClass" ? (
        <MobileListPicker
          options={ASSET_CLASSES.map((ac) => ({ id: ac, label: ASSET_CLASS_LABEL[ac] }))}
          selectedId={assetClass}
          onSelect={(id) => {
            if (!isEdit) setAssetClass(id as AssetClass);
            setView("form");
          }}
        />
      ) : view === "account" ? (
        <MobileListPicker
          options={accounts.map((a) => ({ id: a.id, label: a.name }))}
          selectedId={selectedAccountId}
          onSelect={(id) => {
            setAccountId(id);
            setView("form");
          }}
        />
      ) : accounts.length === 0 ? (
        <p className="text-[14px] font-medium leading-5 text-wl-muted">Add an account first (see Accounts) before tracking a holding.</p>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex h-16 flex-col justify-center gap-1 border-b border-wl-border">
            <label className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Parag Parikh Flexi Cap"
              className="bg-transparent text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink placeholder:text-wl-muted focus:outline-none"
            />
          </div>
          <MobileFieldRow label="Asset class" value={ASSET_CLASS_LABEL[assetClass]} onClick={() => !isEdit && setView("assetClass")} />
          <MobileFieldRow label="Account" value={accounts.find((a) => a.id === selectedAccountId)?.name ?? "Select"} onClick={() => setView("account")} />

          {unitBased ? (
            isEdit && (
              <>
                <div className="flex items-center justify-between rounded-lg bg-wl-surface p-3 text-[14px]">
                  <div>
                    <p className="text-[12px] font-medium text-wl-muted">Quantity</p>
                    <p className="font-semibold text-wl-ink">{editInvestment!.quantity.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-medium text-wl-muted">Avg. cost</p>
                    <p className="font-semibold text-wl-ink">₹{editInvestment!.averageCost.toFixed(4)}</p>
                  </div>
                </div>
                <div className="flex h-16 flex-col justify-center gap-1 border-b border-wl-border">
                  <label className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Current price / NAV</label>
                  <input
                    value={currentPrice}
                    onChange={(e) => setCurrentPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                    placeholder="0"
                    inputMode="decimal"
                    className="bg-transparent text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink placeholder:text-wl-muted focus:outline-none"
                  />
                </div>
                <p className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">
                  To change quantity or average cost, log a buy/sell from the holding&apos;s page instead.
                </p>
              </>
            )
          ) : (
            <>
              <div className="flex h-16 flex-col justify-center gap-1 border-b border-wl-border">
                <label className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Invested amount</label>
                <input
                  value={investedAmount}
                  onChange={(e) => setInvestedAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                  placeholder="0"
                  inputMode="decimal"
                  className="bg-transparent text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink placeholder:text-wl-muted focus:outline-none"
                />
              </div>
              <div className="flex h-16 flex-col justify-center gap-1 border-b border-wl-border">
                <label className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Current value</label>
                <input
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value.replace(/[^0-9.]/g, ""))}
                  placeholder={investedAmount || "Same as invested"}
                  inputMode="decimal"
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
            {submitting ? "Saving…" : isEdit ? "Save changes" : "Add investment"}
          </button>
          {isEdit && (
            <button type="button" onClick={handleDelete} className="flex h-11 items-center justify-center text-[14px] font-semibold text-wl-error">
              Delete investment
            </button>
          )}
        </div>
      )}
    </MobileBottomSheet>
  );
}
