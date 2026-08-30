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
import type { AccountGroup, AccountType } from "@/lib/types";

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

export function AddAccountDialog() {
  const [open, setOpen] = React.useState(false);
  const addAccount = useAppStore((s) => s.addAccount);

  const [name, setName] = React.useState("");
  const [institution, setInstitution] = React.useState("");
  const [balance, setBalance] = React.useState("");
  const [typeIndex, setTypeIndex] = React.useState("0");

  function reset() {
    setName("");
    setInstitution("");
    setBalance("");
    setTypeIndex("0");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    const option = TYPE_OPTIONS[Number(typeIndex)];
    addAccount({
      name,
      institution: institution || "—",
      balance: Number(balance) || 0,
      currency: "INR",
      group: option.group,
      type: option.type,
      isLiabilityAccount: option.group === "credit",
    });
    toast.success("Account added", { description: name });
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> Add account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add account</DialogTitle>
          <DialogDescription>Track a new cash, bank, credit, or investment account.</DialogDescription>
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
            <Button type="submit">Add account</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
