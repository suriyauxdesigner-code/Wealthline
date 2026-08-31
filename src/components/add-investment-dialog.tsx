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
import type { AssetClass } from "@/lib/types";

const ASSET_CLASSES = Object.keys(ASSET_CLASS_LABEL) as AssetClass[];

export function AddInvestmentDialog() {
  const [open, setOpen] = React.useState(false);
  const accounts = useAppStore((s) => s.accounts);
  const addInvestment = useAppStore((s) => s.addInvestment);

  const [name, setName] = React.useState("");
  const [assetClass, setAssetClass] = React.useState<AssetClass>("equity");
  const [accountId, setAccountId] = React.useState("");
  const [quantity, setQuantity] = React.useState("");
  const [averageCost, setAverageCost] = React.useState("");
  const [currentPrice, setCurrentPrice] = React.useState("");

  // Accounts load asynchronously after mount, so default to the first one
  // without a separate effect just to sync that.
  const selectedAccountId = accountId || accounts[0]?.id || "";

  function reset() {
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

    await addInvestment({
      name,
      assetClass,
      accountId: selectedAccountId,
      quantity: numericQuantity,
      averageCost: numericAverageCost,
      currentPrice: numericCurrentPrice,
    });
    toast.success("Investment added", { description: name });
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
        <Button size="sm">
          <Plus /> Add investment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add investment</DialogTitle>
          <DialogDescription>Track a holding — stocks, funds, gold, or crypto.</DialogDescription>
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
            <Button type="submit">Add investment</Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
