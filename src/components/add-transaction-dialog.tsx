"use client";

import * as React from "react";
import { Paperclip, Plus } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/lib/store";
import type { Transaction, TransactionType } from "@/lib/types";

const TYPE_LABEL: Record<TransactionType, string> = {
  expense: "Expense",
  income: "Income",
  transfer: "Transfer",
  investment: "Investment",
};

const TYPE_TO_CATEGORY_KIND: Record<TransactionType, string> = {
  expense: "expense",
  income: "income",
  transfer: "transfer",
  investment: "investment",
};

interface AddTransactionDialogProps {
  trigger?: React.ReactNode;
  defaultType?: TransactionType;
  /** When set, the dialog edits this transaction instead of creating one. */
  editTransaction?: Transaction;
  /** Controlled open state — used when opened from a row action menu with no trigger element. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddTransactionDialog({
  trigger,
  defaultType = "expense",
  editTransaction,
  open: openProp,
  onOpenChange,
}: AddTransactionDialogProps) {
  const isEdit = !!editTransaction;
  const [openState, setOpenState] = React.useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChange ?? setOpenState;

  const accounts = useAppStore((s) => s.accounts);
  const categories = useAppStore((s) => s.categories);
  const liabilities = useAppStore((s) => s.liabilities);
  const addTransaction = useAppStore((s) => s.addTransaction);
  const updateTransaction = useAppStore((s) => s.updateTransaction);

  const [type, setType] = React.useState<TransactionType>(editTransaction?.type ?? defaultType);
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

  const showDebtField = (type === "expense" || type === "transfer") && liabilities.length > 0;

  const relevantCategories = categories.filter((c) => c.kind === TYPE_TO_CATEGORY_KIND[type]);

  function reset() {
    if (isEdit) return;
    setType(defaultType);
    setAmount("");
    setMerchant("");
    setCategoryId("");
    setAccountId(accounts[0]?.id ?? "");
    setToAccountId("");
    setLiabilityId("");
    setDate(new Date());
    setNotes("");
    setTags("");
    setRecurring(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0 || !merchant || !accountId) return;

    const fallbackCategory = relevantCategories[0]?.id ?? categories[0]?.id ?? "";
    const payload = {
      type,
      amount: numericAmount,
      merchant,
      categoryId: categoryId || fallbackCategory,
      accountId,
      toAccountId: toAccountId || undefined,
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

    if (isEdit) {
      updateTransaction(editTransaction!.id, payload);
      toast.success("Transaction updated", { description: `${merchant} · ₹${numericAmount.toLocaleString("en-IN")}` });
    } else {
      addTransaction(payload);
      toast.success(`${TYPE_LABEL[type]} added`, { description: `${merchant} · ₹${numericAmount.toLocaleString("en-IN")}` });
    }
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
      {trigger !== null && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button size="sm">
              <Plus /> Add transaction
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit transaction" : "Add transaction"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the details of this transaction." : "Log an expense, income, transfer, or investment."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Tabs value={type} onValueChange={(v) => setType(v as TransactionType)}>
            <TabsList className="grid w-full grid-cols-4">
              {(Object.keys(TYPE_LABEL) as TransactionType[]).map((t) => (
                <TabsTrigger key={t} value={t}>
                  {TYPE_LABEL[t]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                  ₹
                </span>
                <Input
                  id="amount"
                  inputMode="decimal"
                  autoFocus
                  placeholder="0"
                  className="pl-6 text-base font-medium tabular-nums"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                />
              </div>
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="merchant">{type === "income" ? "Source" : "Merchant / description"}</Label>
              <Input
                id="merchant"
                placeholder={type === "income" ? "e.g. Salary" : "e.g. Swiggy"}
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {relevantCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Account</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(type === "transfer" || type === "investment") && (
              <div className="col-span-2 space-y-1.5">
                <Label>{type === "transfer" ? "To account" : "Investment account"}</Label>
                <Select value={toAccountId} onValueChange={setToAccountId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts
                      .filter((a) => a.id !== accountId)
                      .map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {showDebtField && (
              <div className="col-span-2 space-y-1.5">
                <Label>Pay toward a debt (optional)</Label>
                <Select value={liabilityId || "none"} onValueChange={(v) => setLiabilityId(v === "none" ? "" : v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {liabilities.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {liabilityId && (
                  <p className="text-xs text-muted-foreground">
                    This amount will reduce the outstanding balance on that debt.
                  </p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Date</Label>
              <DatePicker date={date} onSelect={(d) => d && setDate(d)} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" placeholder="comma, separated" value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            {!isEdit && (
              <div className="col-span-2 flex items-center justify-between rounded-md border border-border/70 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Recurring</p>
                  <p className="text-xs text-muted-foreground">Repeat this transaction monthly</p>
                </div>
                <Switch checked={recurring} onCheckedChange={setRecurring} />
              </div>
            )}

            <Button type="button" variant="outline" size="sm" className="col-span-2 text-muted-foreground" disabled>
              <Paperclip /> Attach receipt
            </Button>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEdit ? "Save changes" : "Save transaction"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
