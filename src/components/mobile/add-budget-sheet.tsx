"use client";

import * as React from "react";
import { toast } from "sonner";
import { Morph } from "cube-motion/react";

import { MobileBottomSheet } from "./bottom-sheet";
import { MobileFieldRow } from "./field-row";
import { MobileListPicker } from "./list-picker";
import { MobileDiscardSheet, useDiscardGuard, useIsDirty } from "./discard-guard";
import { resolveIcon } from "@/components/finance/icon-map";
import { useAppStore } from "@/lib/store";
import type { Budget } from "@/lib/types";

interface MobileAddBudgetSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, the sheet edits this budget's limit (and offers delete) instead of creating one. */
  editBudget?: Budget;
}

export function MobileAddBudgetSheet({ open, onOpenChange, editBudget }: MobileAddBudgetSheetProps) {
  const isEdit = !!editBudget;
  const categories = useAppStore((s) => s.categories);
  const budgets = useAppStore((s) => s.budgets);
  const addBudget = useAppStore((s) => s.addBudget);
  const updateBudget = useAppStore((s) => s.updateBudget);
  const deleteBudget = useAppStore((s) => s.deleteBudget);

  const budgetedCategoryIds = new Set(budgets.map((b) => b.categoryId));
  const availableCategories = categories.filter((c) => c.kind === "expense" && !budgetedCategoryIds.has(c.id));

  const [categoryPickerOpen, setCategoryPickerOpen] = React.useState(false);
  const [categoryId, setCategoryId] = React.useState(editBudget?.categoryId ?? "");
  const [limit, setLimit] = React.useState(editBudget ? String(editBudget.limit) : "");
  const [submitting, setSubmitting] = React.useState(false);

  const selectedCategoryId = categoryId || availableCategories[0]?.id || "";
  const editCategory = editBudget ? categories.find((c) => c.id === editBudget.categoryId) : undefined;

  const isDirty = useIsDirty({ categoryId, limit });
  const { confirmOpen, requestClose, keepEditing, discardChanges } = useDiscardGuard(isDirty, () => onOpenChange(false));

  async function handleSubmit() {
    const numericLimit = Number(limit);
    if (!numericLimit || numericLimit <= 0) return;
    setSubmitting(true);
    try {
      if (isEdit) {
        await updateBudget(editBudget!.id, { limit: numericLimit });
        toast.success("Budget updated", { description: editCategory?.name });
      } else {
        if (!selectedCategoryId) return;
        await addBudget({ categoryId: selectedCategoryId, limit: numericLimit });
        const category = categories.find((c) => c.id === selectedCategoryId);
        toast.success("Budget added", { description: category?.name });
      }
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!editBudget) return;
    await deleteBudget(editBudget.id);
    toast.success("Budget removed");
    onOpenChange(false);
  }

  const title = isEdit ? "Edit budget" : "Add budget";

  return (
    <>
    <MobileBottomSheet open={open} onOpenChange={onOpenChange} onRequestClose={requestClose} title={title}>
        <div className="flex flex-col gap-3">
          {!isEdit && (
            <p className="text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-muted">Set a monthly limit for one category.</p>
          )}
          {!isEdit && availableCategories.length === 0 ? (
            <p className="text-[14px] text-wl-muted">Every expense category already has a budget.</p>
          ) : (
            <>
              {isEdit ? (
                <div className="flex h-16 flex-col justify-center gap-1 border-b border-wl-border">
                  <span className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Category</span>
                  <span className="text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink">{editCategory?.name}</span>
                </div>
              ) : (
                <MobileFieldRow
                  label="Category"
                  value={categories.find((c) => c.id === selectedCategoryId)?.name ?? "Select"}
                  onClick={() => setCategoryPickerOpen(true)}
                />
              )}
              <div className="flex h-16 flex-col justify-center gap-1 border-b border-wl-border">
                <label className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Monthly limit</label>
                <input
                  value={limit}
                  onChange={(e) => setLimit(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="0"
                  inputMode="numeric"
                  className="bg-transparent text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink placeholder:text-wl-muted focus:outline-none"
                />
              </div>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="mt-1 flex h-[52px] items-center justify-center rounded-lg bg-wl-accent text-[15px] font-semibold tracking-[-0.6px] text-white disabled:opacity-60"
              >
                <Morph active={submitting} off={isEdit ? "Save changes" : "Save budget"} on="Saving…" />
              </button>
              {isEdit && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex h-11 items-center justify-center text-[14px] font-semibold text-wl-error"
                >
                  Delete budget
                </button>
              )}
            </>
          )}
        </div>
    </MobileBottomSheet>

    {categoryPickerOpen && (
      <MobileBottomSheet
        open={categoryPickerOpen}
        onOpenChange={setCategoryPickerOpen}
        onRequestClose={() => setCategoryPickerOpen(false)}
        title="Budget category"
        stacked
      >
        <MobileListPicker
          options={availableCategories.map((c) => ({
            id: c.id,
            label: c.name,
            icon: React.createElement(resolveIcon(c.icon), { className: "size-6 text-wl-ink", strokeWidth: 1.75 }),
          }))}
          selectedId={selectedCategoryId}
          onSelect={(id) => {
            setCategoryId(id);
            setCategoryPickerOpen(false);
          }}
        />
      </MobileBottomSheet>
    )}

    <MobileDiscardSheet open={confirmOpen} noun="budget" onKeepEditing={keepEditing} onDiscard={discardChanges} />
    </>
  );
}
