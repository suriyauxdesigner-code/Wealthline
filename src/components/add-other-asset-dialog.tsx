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
import type { OtherAsset, OtherAssetCategory } from "@/lib/types";

const CATEGORY_OPTIONS: { value: OtherAssetCategory; label: string }[] = [
  { value: "property", label: "Property" },
  { value: "vehicle", label: "Vehicle" },
  { value: "other", label: "Other" },
];

interface AddOtherAssetDialogProps {
  /** When set, the dialog edits this asset instead of creating one. */
  editAsset?: OtherAsset;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddOtherAssetDialog({ editAsset, trigger, open: openProp, onOpenChange }: AddOtherAssetDialogProps) {
  const isEdit = !!editAsset;
  const [openState, setOpenState] = React.useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChange ?? setOpenState;

  const addOtherAsset = useAppStore((s) => s.addOtherAsset);
  const updateOtherAsset = useAppStore((s) => s.updateOtherAsset);

  const [name, setName] = React.useState(editAsset?.name ?? "");
  const [category, setCategory] = React.useState<OtherAssetCategory>(editAsset?.category ?? "other");
  const [value, setValue] = React.useState(editAsset ? String(editAsset.value) : "");


  function reset() {
    if (isEdit) return;
    setName("");
    setCategory("other");
    setValue("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numericValue = Number(value);
    if (!name || !numericValue) return;

    if (isEdit) {
      await updateOtherAsset(editAsset!.id, { name, category, value: numericValue });
      toast.success("Asset updated", { description: name });
    } else {
      await addOtherAsset({ name, category, value: numericValue });
      toast.success("Asset added", { description: name });
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
            <Button size="sm" variant="outline">
              <Plus /> Add asset
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit asset" : "Add other asset"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this asset's details." : "Property, vehicles, or anything else that counts toward net worth."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="asset-name">Name</Label>
            <Input
              id="asset-name"
              placeholder="e.g. Honda City"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as OtherAssetCategory)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="asset-value">Value</Label>
            <Input
              id="asset-value"
              inputMode="numeric"
              placeholder="0"
              value={value}
              onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, ""))}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEdit ? "Save changes" : "Add asset"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
