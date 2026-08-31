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
import type { LiabilityType } from "@/lib/types";

const TYPE_OPTIONS: { value: LiabilityType; label: string }[] = [
  { value: "credit_card", label: "Credit card" },
  { value: "personal_loan", label: "Personal loan" },
  { value: "vehicle_loan", label: "Vehicle loan" },
  { value: "home_loan", label: "Home loan" },
  { value: "education_loan", label: "Education loan" },
  { value: "other", label: "Other debt" },
];

export function AddLiabilityDialog() {
  const [open, setOpen] = React.useState(false);
  const addLiability = useAppStore((s) => s.addLiability);

  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<LiabilityType>("personal_loan");
  const [principal, setPrincipal] = React.useState("");
  const [outstanding, setOutstanding] = React.useState("");
  const [interestRate, setInterestRate] = React.useState("");
  const [monthlyPayment, setMonthlyPayment] = React.useState("");

  function reset() {
    setName("");
    setType("personal_loan");
    setPrincipal("");
    setOutstanding("");
    setInterestRate("");
    setMonthlyPayment("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numericPrincipal = Number(principal);
    const numericOutstanding = Number(outstanding);
    if (!name || !numericPrincipal || !numericOutstanding) return;

    await addLiability({
      name,
      type,
      principal: numericPrincipal,
      outstanding: numericOutstanding,
      interestRate: Number(interestRate) || 0,
      monthlyPayment: Number(monthlyPayment) || 0,
    });
    toast.success("Liability added", { description: name });
    reset();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus /> Add liability
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add liability</DialogTitle>
          <DialogDescription>Track a loan or debt that counts against your net worth.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="liability-name">Name</Label>
            <Input
              id="liability-name"
              placeholder="e.g. Home Loan — SBI"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as LiabilityType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="liability-principal">Principal</Label>
              <Input
                id="liability-principal"
                inputMode="numeric"
                placeholder="0"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value.replace(/[^0-9]/g, ""))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="liability-outstanding">Outstanding</Label>
              <Input
                id="liability-outstanding"
                inputMode="numeric"
                placeholder="0"
                value={outstanding}
                onChange={(e) => setOutstanding(e.target.value.replace(/[^0-9]/g, ""))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="liability-rate">Interest rate %</Label>
              <Input
                id="liability-rate"
                inputMode="decimal"
                placeholder="0"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value.replace(/[^0-9.]/g, ""))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="liability-payment">Monthly payment</Label>
              <Input
                id="liability-payment"
                inputMode="numeric"
                placeholder="0"
                value={monthlyPayment}
                onChange={(e) => setMonthlyPayment(e.target.value.replace(/[^0-9]/g, ""))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add liability</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
