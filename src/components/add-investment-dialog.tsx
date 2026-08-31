"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { ASSET_CLASS_LABEL, isUnitBasedAssetClass } from "@/lib/investment-selectors";
import { formatINR } from "@/lib/calculations";
import { useAppStore } from "@/lib/store";
import type { AssetClass, Investment } from "@/lib/types";

const ASSET_CLASSES = Object.keys(ASSET_CLASS_LABEL) as AssetClass[];

interface AddInvestmentDialogProps {
  /** When set, the dialog edits this investment instead of creating one. */
  editInvestment?: Investment;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddInvestmentDialog({
  editInvestment,
  trigger,
  open: openProp,
  onOpenChange,
}: AddInvestmentDialogProps) {
  const isEdit = !!editInvestment;
  const [openState, setOpenState] = React.useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChange ?? setOpenState;
  const router = useRouter();

  const accounts = useAppStore((s) => s.accounts);
  const addInvestment = useAppStore((s) => s.addInvestment);
  const updateInvestment = useAppStore((s) => s.updateInvestment);

  const [name, setName] = React.useState(editInvestment?.name ?? "");
  const [assetClass, setAssetClass] = React.useState<AssetClass>(editInvestment?.assetClass ?? "equity");
  const [accountId, setAccountId] = React.useState(editInvestment?.accountId ?? "");
  // Unit-based holdings only ever expose the LTP for editing here — quantity
  // and average cost are derived from the transaction log (see the detail
  // page's "Log transaction"), so they never diverge from that history.
  const [currentPrice, setCurrentPrice] = React.useState(editInvestment ? String(editInvestment.currentPrice) : "");
  // Value-based holdings (FD/EPF/PPF/Bonds) store quantity=1 and reuse
  // averageCost/currentPrice as investedAmount/currentValue — these two
  // fields drive that simplified form instead.
  const [investedAmount, setInvestedAmount] = React.useState(
    editInvestment ? String(editInvestment.quantity * editInvestment.averageCost) : ""
  );
  const [currentValue, setCurrentValue] = React.useState(
    editInvestment ? String(editInvestment.quantity * editInvestment.currentPrice) : ""
  );
  const [submitting, setSubmitting] = React.useState(false);

  const unitBased = isUnitBasedAssetClass(assetClass);

  // Accounts load asynchronously after mount, so default to the first one
  // without a separate effect just to sync that.
  const selectedAccountId = accountId || accounts[0]?.id || "";

  function reset() {
    if (isEdit) return;
    setName("");
    setAssetClass("equity");
    setAccountId("");
    setCurrentPrice("");
    setInvestedAmount("");
    setCurrentValue("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
          reset();
          setOpen(false);
        } else {
          const created = await addInvestment({
            name,
            assetClass,
            accountId: selectedAccountId,
            quantity: 0,
            averageCost: 0,
            currentPrice: 0,
          });
          reset();
          setOpen(false);
          if (created) {
            toast.success("Investment added", { description: "Now log its units to build a history." });
            router.push(`/investments/${created.id}`);
          }
        }
      } else {
        const numericInvested = Number(investedAmount);
        const numericCurrent = Number(currentValue);
        if (!numericInvested || !numericCurrent) {
          setSubmitting(false);
          return;
        }
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
        reset();
        setOpen(false);
      }
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
              <Plus /> Add investment
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit investment" : "Add investment"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? unitBased
                ? "Update this holding's details. Quantity and average cost come from its transaction log."
                : "Update this holding's details."
              : "Register a holding — you'll log its units and price next."}
          </DialogDescription>
        </DialogHeader>
        {accounts.length === 0 ? (
          <Alert>
            <AlertDescription>
              You need an account to hold this investment first.{" "}
              <Link href="/accounts" className="font-medium text-foreground hover:underline">
                Add an account
              </Link>{" "}
              (e.g. a brokerage or demat account), then come back here.
            </AlertDescription>
          </Alert>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="investment-name">Name</Label>
            <Input
              id="investment-name"
              placeholder="e.g. HDFC Bank Ltd."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Asset class</Label>
              <Select
                value={assetClass}
                onValueChange={(v) => setAssetClass(v as AssetClass)}
                disabled={isEdit}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_CLASSES.map((ac) => (
                    <SelectItem key={ac} value={ac}>
                      {ASSET_CLASS_LABEL[ac]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Account</Label>
              <Select value={selectedAccountId} onValueChange={setAccountId}>
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
          </div>

          {unitBased ? (
            isEdit && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Quantity</p>
                    <p className="font-medium tabular-nums">{editInvestment!.quantity.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg. cost</p>
                    <p className="font-medium tabular-nums">{formatINR(editInvestment!.averageCost, { decimals: 4 })}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="investment-ltp">Current price / NAV (LTP)</Label>
                  <Input
                    id="investment-ltp"
                    inputMode="decimal"
                    placeholder="0"
                    value={currentPrice}
                    onChange={(e) => setCurrentPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  To change quantity or average cost, log a buy/sell on the holding&apos;s detail page instead.
                </p>
              </div>
            )
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="investment-invested">Invested amount</Label>
                <Input
                  id="investment-invested"
                  inputMode="decimal"
                  placeholder="0"
                  value={investedAmount}
                  onChange={(e) => setInvestedAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="investment-current-value">Current value</Label>
                <Input
                  id="investment-current-value"
                  inputMode="decimal"
                  placeholder="0"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value.replace(/[^0-9.]/g, ""))}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : isEdit ? "Save changes" : "Add investment"}
            </Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
