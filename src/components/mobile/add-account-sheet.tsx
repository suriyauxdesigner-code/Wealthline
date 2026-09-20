"use client";

import * as React from "react";
import { toast } from "sonner";

import { MobileBottomSheet } from "./bottom-sheet";
import { MobileFieldRow } from "./field-row";
import { MobileListPicker } from "./list-picker";
import { ACCOUNT_TYPE_OPTIONS, typeOptionsFor } from "@/components/add-account-dialog";
import { useAppStore } from "@/lib/store";
import type { Account } from "@/lib/types";

interface MobileAddAccountSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editAccount?: Account;
}

export function MobileAddAccountSheet({ open, onOpenChange, editAccount }: MobileAddAccountSheetProps) {
  const isEdit = !!editAccount;
  const addAccount = useAppStore((s) => s.addAccount);
  const updateAccount = useAppStore((s) => s.updateAccount);
  const deleteAccount = useAppStore((s) => s.deleteAccount);

  const typeOptions = React.useMemo(() => typeOptionsFor(editAccount), [editAccount]);
  const [view, setView] = React.useState<"form" | "type">("form");
  const [name, setName] = React.useState(editAccount?.name ?? "");
  const [typeIndex, setTypeIndex] = React.useState(() => {
    if (!editAccount) return 0;
    const i = typeOptions.findIndex((o) => o.group === editAccount.group && o.type === editAccount.type);
    return i === -1 ? 0 : i;
  });
  const [institution, setInstitution] = React.useState(editAccount?.institution ?? "");
  const [balance, setBalance] = React.useState(editAccount ? String(editAccount.balance) : "");
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit() {
    if (!name) return;
    const option = typeOptions[typeIndex] ?? ACCOUNT_TYPE_OPTIONS[0];
    const payload = {
      name,
      institution: institution.trim(),
      balance: Number(balance) || 0,
      currency: "INR" as const,
      group: option.group,
      type: option.type,
      isLiabilityAccount: option.group === "credit",
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await updateAccount(editAccount!.id, payload);
        toast.success("Account updated", { description: name });
      } else {
        await addAccount(payload);
        toast.success("Account added", { description: name });
      }
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!editAccount) return;
    if (!window.confirm(`Delete ${editAccount.name}? This also permanently deletes every transaction recorded against it.`)) return;
    await deleteAccount(editAccount.id);
    toast.success("Account deleted", { description: editAccount.name });
    onOpenChange(false);
  }

  const title = view === "type" ? "Account type" : isEdit ? "Edit account" : "Add account";

  return (
    <MobileBottomSheet open={open} onOpenChange={onOpenChange} title={title}>
      {view === "type" ? (
        <MobileListPicker
          options={typeOptions.map((o, i) => ({ id: String(i), label: o.label }))}
          selectedId={String(typeIndex)}
          onSelect={(id) => {
            setTypeIndex(Number(id));
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
              placeholder="e.g. SBI Savings"
              className="bg-transparent text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink placeholder:text-wl-muted focus:outline-none"
            />
          </div>
          <MobileFieldRow label="Type" value={typeOptions[typeIndex]?.label ?? "Select"} onClick={() => setView("type")} />
          <div className="flex h-16 flex-col justify-center gap-1 border-b border-wl-border">
            <label className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Institution · optional</label>
            <input
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="e.g. State Bank of India"
              className="bg-transparent text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink placeholder:text-wl-muted focus:outline-none"
            />
          </div>
          <div className="flex h-16 flex-col justify-center gap-1 border-b border-wl-border">
            <label className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Opening balance</label>
            <input
              value={balance}
              onChange={(e) => setBalance(e.target.value.replace(/[^0-9]/g, ""))}
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
            {submitting ? "Saving…" : isEdit ? "Save changes" : "Add account"}
          </button>
          {isEdit && (
            <button type="button" onClick={handleDelete} className="flex h-11 items-center justify-center text-[14px] font-semibold text-wl-error">
              Delete account
            </button>
          )}
        </div>
      )}
    </MobileBottomSheet>
  );
}
