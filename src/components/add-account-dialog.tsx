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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import type { Account, AccountGroup, AccountType } from "@/lib/types";

const TYPE_OPTIONS: { group: AccountGroup; type: AccountType; label: string }[] = [
  { group: "cash", type: "cash_wallet", label: "Cash wallet" },
  { group: "bank", type: "savings", label: "Savings account" },
  { group: "bank", type: "current", label: "Current account" },
  { group: "credit", type: "credit_card", label: "Credit card" },
  { group: "investment", type: "brokerage", label: "Brokerage" },
  { group: "investment", type: "mutual_fund", label: "Mutual fund" },
  { group: "investment", type: "etf", label: "ETF" },
  { group: "investment", type: "crypto", label: "Crypto" },
  { group: "other", type: "epf", label: "EPF" },
  { group: "other", type: "ppf", label: "PPF" },
  { group: "other", type: "fd", label: "Fixed deposit" },
  { group: "other", type: "gold", label: "Gold" },
];

function typeIndexFor(group: AccountGroup, type: AccountType): string {
  const i = TYPE_OPTIONS.findIndex((o) => o.group === group && o.type === type);
  return String(i === -1 ? 0 : i);
}

interface AddAccountDialogProps {
  /** When set, the dialog edits this account instead of creating one. */
  editAccount?: Account;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddAccountDialog({ editAccount, trigger, open: openProp, onOpenChange }: AddAccountDialogProps) {
  const isEdit = !!editAccount;
  const [openState, setOpenState] = React.useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChange ?? setOpenState;

  const addAccount = useAppStore((s) => s.addAccount);
  const updateAccount = useAppStore((s) => s.updateAccount);

  const [name, setName] = React.useState(editAccount?.name ?? "");
  const [institution, setInstitution] = React.useState(editAccount?.institution ?? "");
  const [balance, setBalance] = React.useState(editAccount ? String(editAccount.balance) : "");
  const [typeIndex, setTypeIndex] = React.useState(
    editAccount ? typeIndexFor(editAccount.group, editAccount.type) : "0"
  );

  function reset() {
    if (isEdit) return;
    setName("");
    setInstitution("");
    setBalance("");
    setTypeIndex("0");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    const option = TYPE_OPTIONS[Number(typeIndex)];
    const payload = {
      name,
      institution: institution || "—",
      balance: Number(balance) || 0,
      currency: "INR" as const,
      group: option.group,
      type: option.type,
      isLiabilityAccount: option.group === "credit",
    };

    if (isEdit) {
      await updateAccount(editAccount!.id, payload);
      toast.success("Account updated", { description: name });
    } else {
      await addAccount(payload);
      toast.success("Account added", { description: name });
    }
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      {trigger !== null && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button size="sm">
              <Plus /> Add account
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit account" : "Add account"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this account's details." : "Track a new cash, bank, credit, or investment account."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. ICICI Savings" autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={typeIndex} onValueChange={setTypeIndex}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((o, i) => (
                  <SelectItem key={i} value={String(i)}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Institution</Label>
              <Input value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="e.g. ICICI Bank" />
            </div>
            <div className="space-y-1.5">
              <Label>Balance</Label>
              <Input value={balance} onChange={(e) => setBalance(e.target.value.replace(/[^0-9]/g, ""))} placeholder="0" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEdit ? "Save changes" : "Add account"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
