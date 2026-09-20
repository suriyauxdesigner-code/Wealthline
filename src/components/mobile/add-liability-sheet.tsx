"use client";

import * as React from "react";
import { toast } from "sonner";

import { MobileBottomSheet } from "./bottom-sheet";
import { MobileFieldRow } from "./field-row";
import { MobileListPicker } from "./list-picker";
import { useAppStore } from "@/lib/store";
import type { Liability, LiabilityType } from "@/lib/types";

const TYPE_OPTIONS: { value: LiabilityType; label: string }[] = [
  { value: "credit_card", label: "Credit card" },
  { value: "personal_loan", label: "Personal loan" },
  { value: "vehicle_loan", label: "Vehicle loan" },
  { value: "home_loan", label: "Home loan" },
  { value: "education_loan", label: "Education loan" },
  { value: "other", label: "Other debt" },
];

interface MobileAddLiabilitySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editLiability?: Liability;
}

export function MobileAddLiabilitySheet({ open, onOpenChange, editLiability }: MobileAddLiabilitySheetProps) {
  const isEdit = !!editLiability;
  const addLiability = useAppStore((s) => s.addLiability);
  const updateLiability = useAppStore((s) => s.updateLiability);
  const deleteLiability = useAppStore((s) => s.deleteLiability);

  const [view, setView] = React.useState<"form" | "type">("form");
  const [name, setName] = React.useState(editLiability?.name ?? "");
  const [type, setType] = React.useState<LiabilityType>(editLiability?.type ?? "personal_loan");
  const [principal, setPrincipal] = React.useState(editLiability ? String(editLiability.principal) : "");
  const [outstanding, setOutstanding] = React.useState(editLiability ? String(editLiability.outstanding) : "");
  const [interestRate, setInterestRate] = React.useState(editLiability ? String(editLiability.interestRate) : "");
  const [monthlyPayment, setMonthlyPayment] = React.useState(editLiability ? String(editLiability.monthlyPayment) : "");
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit() {
    const numericPrincipal = Number(principal);
    const numericOutstanding = outstanding === "" ? numericPrincipal : Number(outstanding);
    if (!name || !numericPrincipal || numericPrincipal <= 0 || Number.isNaN(numericOutstanding) || numericOutstanding < 0) return;

    const payload = {
      name,
      type,
      principal: numericPrincipal,
      outstanding: numericOutstanding,
      interestRate: Number(interestRate) || 0,
      monthlyPayment: Number(monthlyPayment) || 0,
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await updateLiability(editLiability!.id, payload);
        toast.success("Debt updated", { description: name });
      } else {
        await addLiability(payload);
        toast.success("Debt added", { description: name });
      }
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!editLiability) return;
    await deleteLiability(editLiability.id);
    toast.success("Debt removed");
    onOpenChange(false);
  }

  const title = view === "type" ? "Debt type" : isEdit ? "Edit liability" : "Add liability";

  return (
    <MobileBottomSheet open={open} onOpenChange={onOpenChange} title={title}>
      {view === "type" ? (
        <MobileListPicker
          options={TYPE_OPTIONS.map((o) => ({ id: o.value, label: o.label }))}
          selectedId={type}
          onSelect={(id) => {
            setType(id as LiabilityType);
            setView("form");
          }}
        />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex h-16 flex-col justify-center gap-1 border-b border-wl-border">
            <label className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Camera"
              className="bg-transparent text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink placeholder:text-wl-muted focus:outline-none"
            />
          </div>
          <MobileFieldRow label="Type" value={TYPE_OPTIONS.find((o) => o.value === type)?.label ?? "Select"} onClick={() => setView("type")} />
          <div className="flex h-16 flex-col justify-center gap-1 border-b border-wl-border">
            <label className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Principal</label>
            <input
              value={principal}
              onChange={(e) => setPrincipal(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="0"
              inputMode="numeric"
              className="bg-transparent text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink placeholder:text-wl-muted focus:outline-none"
            />
          </div>
          <div className="flex h-16 flex-col justify-center gap-1 border-b border-wl-border">
            <label className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Outstanding balance</label>
            <input
              value={outstanding}
              onChange={(e) => setOutstanding(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder={principal || "Same as principal"}
              inputMode="numeric"
              className="bg-transparent text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink placeholder:text-wl-muted focus:outline-none"
            />
          </div>
          <div className="flex h-16 flex-col justify-center gap-1 border-b border-wl-border">
            <label className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Interest rate</label>
            <input
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0% per year"
              inputMode="decimal"
              className="bg-transparent text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink placeholder:text-wl-muted focus:outline-none"
            />
          </div>
          <div className="flex h-16 flex-col justify-center gap-1 border-b border-wl-border">
            <label className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Monthly payment</label>
            <input
              value={monthlyPayment}
              onChange={(e) => setMonthlyPayment(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="0"
              inputMode="numeric"
              className="bg-transparent text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink placeholder:text-wl-muted focus:outline-none"
            />
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="mt-1 flex h-[52px] items-center justify-center rounded-lg bg-wl-accent text-[15px] font-semibold tracking-[-0.6px] text-white disabled:opacity-60"
          >
            {submitting ? "Saving…" : isEdit ? "Save changes" : "Add liability"}
          </button>
          {isEdit && (
            <button type="button" onClick={handleDelete} className="flex h-11 items-center justify-center text-[14px] font-semibold text-wl-error">
              Delete debt
            </button>
          )}
        </div>
      )}
    </MobileBottomSheet>
  );
}
