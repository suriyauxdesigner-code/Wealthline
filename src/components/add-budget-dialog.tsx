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

export function AddBudgetDialog() {
  const [open, setOpen] = React.useState(false);
  const categories = useAppStore((s) => s.categories);
  const budgets = useAppStore((s) => s.budgets);
  const addBudget = useAppStore((s) => s.addBudget);

  // A category can only ever have one standing budget — already-budgeted
  // categories are hidden here; use Edit on the existing budget instead.
  const budgetedCategoryIds = new Set(budgets.map((b) => b.categoryId));
  const availableCategories = categories.filter((c) => c.kind === "expense" && !budgetedCategoryIds.has(c.id));

  const [categoryId, setCategoryId] = React.useState("");
  const [limit, setLimit] = React.useState("");

  // No categoryId chosen yet (dialog just opened) — default to the first
  // available category without a separate effect just to sync that.
  const selectedCategoryId = categoryId || availableCategories[0]?.id || "";

  function reset() {
    setCategoryId("");
    setLimit("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numericLimit = Number(limit);
    if (!selectedCategoryId || !numericLimit || numericLimit <= 0) return;

    await addBudget({ categoryId: selectedCategoryId, limit: numericLimit });
    const category = categories.find((c) => c.id === selectedCategoryId);
    toast.success("Budget added", { description: category?.name });
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
        <Button size="sm" disabled={availableCategories.length === 0 && categories.length > 0}>
          <Plus /> Add budget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add budget</DialogTitle>
          <DialogDescription>Set a monthly spending limit for a category.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={selectedCategoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="budget-limit">Monthly limit</Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                ₹
              </span>
              <Input
                id="budget-limit"
                inputMode="numeric"
                className="pl-6"
                placeholder="0"
                value={limit}
                onChange={(e) => setLimit(e.target.value.replace(/[^0-9]/g, ""))}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedCategoryId}>
              Add budget
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
