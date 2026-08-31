"use client";

import * as React from "react";
import Link from "next/link";
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
import { ASSET_CLASS_LABEL } from "@/lib/investment-selectors";
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

  const accounts = useAppStore((s) => s.accounts);
  const addInvestment = useAppStore((s) => s.addInvestment);
  const updateInvestment = useAppStore((s) => s.updateInvestment);

  const [name, setName] = React.useState(editInvestment?.name ?? "");
  const [assetClass, setAssetClass] = React.useState<AssetClass>(editInvestment?.assetClass ?? "equity");
  const [accountId, setAccountId] = React.useState(editInvestment?.accountId ?? "");
  const [quantity, setQuantity] = React.useState(editInvestment ? String(editInvestment.quantity) : "");
  const [averageCost, setAverageCost] = React.useState(editInvestment ? String(editInvestment.averageCost) : "");
  const [currentPrice, setCurrentPrice] = React.useState(editInvestment ? String(editInvestment.currentPrice) : "");

  // Accounts load asynchronously after mount, so default to the first one
  // without a separate effect just to sync that.
  const selectedAccountId = accountId || accounts[0]?.id || "";

  function reset() {
    if (isEdit) return;
    setName("");
    setAssetClass("equity");
    setAccountId("");
    setQuantity("");
    setAverageCost("");
    setCurrentPrice("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numericQuantity = Number(quantity);
    const numericAverageCost = Number(averageCost);
    const numericCurrentPrice = Number(currentPrice);
    if (!name || !selectedAccountId || !numericQuantity || !numericAverageCost || !numericCurrentPrice) return;

    const payload = {
      name,
      assetClass,
      accountId: selectedAccountId,
      quantity: numericQuantity,
      averageCost: numericAverageCost,
      currentPrice: numericCurrentPrice,
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
            {isEdit ? "Update this holding's details." : "Track a holding — stocks, funds, gold, or crypto."}
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
              <Select value={assetClass} onValueChange={(v) => setAssetClass(v as AssetClass)}>
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
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="investment-quantity">Quantity</Label>
              <Input
                id="investment-quantity"
                inputMode="decimal"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value.replace(/[^0-9.]/g, ""))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="investment-avg-cost">Avg. cost</Label>
              <Input
                id="investment-avg-cost"
                inputMode="decimal"
                placeholder="0"
                value={averageCost}
                onChange={(e) => setAverageCost(e.target.value.replace(/[^0-9.]/g, ""))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="investment-ltp">LTP</Label>
              <Input
                id="investment-ltp"
                inputMode="decimal"
                placeholder="0"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value.replace(/[^0-9.]/g, ""))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEdit ? "Save changes" : "Add investment"}</Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
