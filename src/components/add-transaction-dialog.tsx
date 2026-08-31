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
import { formatINR } from "@/lib/calculations";
import { ASSET_CLASS_LABEL, isUnitBasedAssetClass } from "@/lib/investment-selectors";
import * as investmentTransactionsRepo from "@/lib/repositories/investment-transactions";
import { useAppStore } from "@/lib/store";
import type { Investment, Transaction, TransactionType } from "@/lib/types";

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

type BuySell = "buy" | "sell";

const DIRECTION_LABEL: Record<BuySell, string> = { buy: "Buy", sell: "Sell" };

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
  const investments = useAppStore((s) => s.investments);
  const addTransaction = useAppStore((s) => s.addTransaction);
  const updateTransaction = useAppStore((s) => s.updateTransaction);
  const linkInvestmentTransaction = useAppStore((s) => s.linkInvestmentTransaction);
  const updateLinkedInvestmentTransaction = useAppStore((s) => s.updateLinkedInvestmentTransaction);
  const unlinkInvestmentTransaction = useAppStore((s) => s.unlinkInvestmentTransaction);

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
  const [submitting, setSubmitting] = React.useState(false);

  // Investment tab — picking a holding here logs a Buy/Sell against it
  // (unit-based) or adds to its invested total (FD/EPF/PPF/Bonds), in
  // addition to moving money between accounts like any other transaction.
  const [investmentId, setInvestmentId] = React.useState(editTransaction?.investmentId ?? "");
  const [investmentDirection, setInvestmentDirection] = React.useState<BuySell>("buy");
  const [investmentQuantity, setInvestmentQuantity] = React.useState("");
  const [investmentPrice, setInvestmentPrice] = React.useState("");
  // The investment_transactions row already linked to this transaction, if
  // any — fetched once on mount so editing a unit-based Buy/Sell prefills
  // its real quantity/price instead of guessing from the plain amount.
  const [linkedLedgerId, setLinkedLedgerId] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (!editTransaction?.investmentId) return;
    let cancelled = false;
    investmentTransactionsRepo.getInvestmentTransactionByLinkedTransaction(editTransaction.id).then((ledger) => {
      if (cancelled || !ledger) return;
      setLinkedLedgerId(ledger.id);
      setInvestmentDirection(ledger.type === "sell" ? "sell" : "buy");
      setInvestmentQuantity(String(ledger.quantity));
      setInvestmentPrice(String(ledger.price));
    });
    return () => {
      cancelled = true;
    };
  }, [editTransaction?.id, editTransaction?.investmentId]);

  const showDebtField = (type === "expense" || type === "transfer") && liabilities.length > 0;
  const selectedInvestment = investments.find((i) => i.id === investmentId);
  const isUnitBasedSelected = type === "investment" && !!selectedInvestment && isUnitBasedAssetClass(selectedInvestment.assetClass);
  const isValueBasedSelected = type === "investment" && !!selectedInvestment && !isUnitBasedSelected;

  const relevantCategories = categories.filter((c) => c.kind === TYPE_TO_CATEGORY_KIND[type]);

  function applyInvestmentAccountRoles(inv: Investment, direction: BuySell) {
    if (direction === "sell") {
      setAccountId(inv.accountId);
    } else {
      setToAccountId(inv.accountId);
    }
  }

  function handleInvestmentSelect(id: string) {
    const nextId = id === "none" ? "" : id;
    setInvestmentId(nextId);
    const inv = investments.find((i) => i.id === nextId);
    if (!inv) return;
    if (!merchant) setMerchant(inv.name);
    if (isUnitBasedAssetClass(inv.assetClass)) {
      setInvestmentPrice(inv.currentPrice ? String(inv.currentPrice) : "");
      applyInvestmentAccountRoles(inv, investmentDirection);
    }
  }

  function handleDirectionChange(direction: BuySell) {
    setInvestmentDirection(direction);
    if (selectedInvestment && isUnitBasedAssetClass(selectedInvestment.assetClass)) {
      applyInvestmentAccountRoles(selectedInvestment, direction);
    }
  }

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
    setInvestmentId("");
    setInvestmentDirection("buy");
    setInvestmentQuantity("");
    setInvestmentPrice("");
    setLinkedLedgerId(undefined);
  }

  // Keeps the investment_transactions ledger (unit-based holdings only) in
  // sync with whatever this transaction now says — create, update, move to
  // a different holding, or unlink, covering both the create and edit paths.
  async function syncInvestmentLedger(transactionId: string, isoDate: string) {
    const wasLinkedTo = editTransaction?.investmentId;
    const wasUnitBasedLinked = !!linkedLedgerId;

    if (isUnitBasedSelected && investmentId) {
      const details = {
        type: investmentDirection,
        quantity: Number(investmentQuantity),
        price: Number(investmentPrice),
        date: isoDate,
      };
      if (wasUnitBasedLinked && wasLinkedTo === investmentId) {
        await updateLinkedInvestmentTransaction(linkedLedgerId!, investmentId, details);
      } else {
        if (wasUnitBasedLinked && wasLinkedTo) {
          await unlinkInvestmentTransaction(linkedLedgerId!, wasLinkedTo);
        }
        await linkInvestmentTransaction(transactionId, investmentId, details);
      }
    } else if (wasUnitBasedLinked && wasLinkedTo) {
      await unlinkInvestmentTransaction(linkedLedgerId!, wasLinkedTo);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let numericAmount: number;
    if (isUnitBasedSelected) {
      const qty = Number(investmentQuantity);
      const price = Number(investmentPrice);
      numericAmount = qty * price;
      if (!qty || !price) return;
    } else {
      numericAmount = Number(amount);
    }
    if (!numericAmount || numericAmount <= 0 || !merchant || !accountId) return;

    const fallbackCategory = relevantCategories[0]?.id ?? categories[0]?.id ?? "";
    const isoDate = date.toISOString().slice(0, 10);
    const payload = {
      type,
      amount: numericAmount,
      merchant,
      categoryId: categoryId || fallbackCategory,
      accountId,
      toAccountId: toAccountId || undefined,
      liabilityId: showDebtField ? liabilityId || undefined : undefined,
      investmentId: type === "investment" ? investmentId || undefined : undefined,
      date: isoDate,
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
        if (type === "investment") await syncInvestmentLedger(editTransaction!.id, isoDate);
        toast.success("Transaction updated", { description: `${merchant} · ₹${numericAmount.toLocaleString("en-IN")}` });
      } else {
        const created = await addTransaction(payload);
        if (created && type === "investment") await syncInvestmentLedger(created.id, isoDate);
        toast.success(`${TYPE_LABEL[type]} added`, { description: `${merchant} · ₹${numericAmount.toLocaleString("en-IN")}` });
      }
      reset();
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
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
            {type === "investment" && (
              <div className="col-span-2 space-y-1.5">
                <Label>Investment</Label>
                <Select value={investmentId || "none"} onValueChange={handleInvestmentSelect}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="General (no specific holding)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">General (no specific holding)</SelectItem>
                    {investments.map((inv) => (
                      <SelectItem key={inv.id} value={inv.id}>
                        {inv.name} ({ASSET_CLASS_LABEL[inv.assetClass]})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {isUnitBasedSelected && (
              <div className="col-span-2 space-y-3">
                <Tabs value={investmentDirection} onValueChange={(v) => handleDirectionChange(v as BuySell)}>
                  <TabsList className="grid w-full grid-cols-2">
                    {(Object.keys(DIRECTION_LABEL) as BuySell[]).map((d) => (
                      <TabsTrigger key={d} value={d}>
                        {DIRECTION_LABEL[d]}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="inv-quantity">Quantity / units</Label>
                    <Input
                      id="inv-quantity"
                      inputMode="decimal"
                      autoFocus
                      placeholder="0"
                      value={investmentQuantity}
                      onChange={(e) => setInvestmentQuantity(e.target.value.replace(/[^0-9.]/g, ""))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="inv-price">Price / NAV</Label>
                    <Input
                      id="inv-price"
                      inputMode="decimal"
                      placeholder="0"
                      value={investmentPrice}
                      onChange={(e) => setInvestmentPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                    />
                  </div>
                </div>
                {Number(investmentQuantity) > 0 && Number(investmentPrice) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Total {investmentDirection === "buy" ? "cost" : "proceeds"}:{" "}
                    <span className="font-medium text-foreground">
                      {formatINR(Number(investmentQuantity) * Number(investmentPrice), { decimals: 2 })}
                    </span>
                  </p>
                )}
              </div>
            )}

            {!isUnitBasedSelected && (
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="amount">{isValueBasedSelected ? "Contribution amount" : "Amount"}</Label>
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
                {isValueBasedSelected && (
                  <p className="text-xs text-muted-foreground">This will be added to the holding&apos;s invested amount.</p>
                )}
              </div>
            )}

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
              <Label>{isUnitBasedSelected && investmentDirection === "sell" ? "Account (auto: broker)" : "Account"}</Label>
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
              {isUnitBasedSelected && investmentDirection === "sell" && (
                <p className="text-xs text-muted-foreground">
                  Pre-filled from {selectedInvestment!.name}&apos;s linked account.
                </p>
              )}
            </div>

            {(type === "transfer" || type === "investment") && (
              <div className="col-span-2 space-y-1.5">
                <Label>
                  {type === "transfer"
                    ? "To account"
                    : isUnitBasedSelected && investmentDirection === "sell"
                      ? "Deposit proceeds to"
                      : "Investment account"}
                </Label>
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
                {isUnitBasedSelected && investmentDirection === "buy" && (
                  <p className="text-xs text-muted-foreground">
                    Pre-filled from {selectedInvestment!.name}&apos;s linked account — change it if this trade settled elsewhere.
                  </p>
                )}
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
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : isEdit ? "Save changes" : "Save transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
