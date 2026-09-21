"use client";

import * as React from "react";
import { toast } from "sonner";

import { MobileBottomSheet } from "./bottom-sheet";
import { MobileDateField } from "./date-field";
import { useAppStore } from "@/lib/store";
import type { Goal } from "@/lib/types";

const COLORS = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "chart-6"];

interface MobileAddGoalSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editGoal?: Goal;
}

export function MobileAddGoalSheet({ open, onOpenChange, editGoal }: MobileAddGoalSheetProps) {
  const isEdit = !!editGoal;
  const addGoal = useAppStore((s) => s.addGoal);
  const updateGoal = useAppStore((s) => s.updateGoal);
  const deleteGoal = useAppStore((s) => s.deleteGoal);

  const [name, setName] = React.useState(editGoal?.name ?? "");
  const [target, setTarget] = React.useState(editGoal ? String(editGoal.targetAmount) : "");
  const [current, setCurrent] = React.useState(editGoal ? String(editGoal.currentAmount) : "");
  const [date, setDate] = React.useState(editGoal?.targetDate ?? "");
  const [contribution, setContribution] = React.useState(editGoal ? String(editGoal.monthlyContribution) : "");
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit() {
    if (!name || !target || !date) return;
    const payload = {
      name,
      targetAmount: Number(target),
      currentAmount: Number(current) || 0,
      targetDate: date,
      monthlyContribution: Number(contribution) || 0,
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await updateGoal(editGoal!.id, payload);
        toast.success("Goal updated", { description: name });
      } else {
        await addGoal({
          ...payload,
          icon: "ShieldCheck",
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
        toast.success("Goal created", { description: name });
      }
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!editGoal) return;
    await deleteGoal(editGoal.id);
    toast.success("Goal removed");
    onOpenChange(false);
  }

  return (
    <MobileBottomSheet open={open} onOpenChange={onOpenChange} title={isEdit ? "Edit goal" : "New goal"}>
      <div className="flex flex-col gap-3">
        <div className="flex h-16 flex-col justify-center gap-1 border-b border-wl-border">
          <label className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Travel fund"
            className="bg-transparent text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink placeholder:text-wl-muted focus:outline-none"
          />
        </div>
        <div className="flex h-16 flex-col justify-center gap-1 border-b border-wl-border">
          <label className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Target amount</label>
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="0"
            inputMode="numeric"
            className="bg-transparent text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink placeholder:text-wl-muted focus:outline-none"
          />
        </div>
        <div className="flex h-16 flex-col justify-center gap-1 border-b border-wl-border">
          <label className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Already saved</label>
          <input
            value={current}
            onChange={(e) => setCurrent(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="0"
            inputMode="numeric"
            className="bg-transparent text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink placeholder:text-wl-muted focus:outline-none"
          />
        </div>
        <MobileDateField label="Target date" value={date} onChange={setDate} />
        <div className="flex h-16 flex-col justify-center gap-1 border-b border-wl-border">
          <label className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">Monthly contribution</label>
          <input
            value={contribution}
            onChange={(e) => setContribution(e.target.value.replace(/[^0-9]/g, ""))}
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
          {submitting ? "Saving…" : isEdit ? "Save changes" : "Create goal"}
        </button>
        {isEdit && (
          <button type="button" onClick={handleDelete} className="flex h-11 items-center justify-center text-[14px] font-semibold text-wl-error">
            Delete goal
          </button>
        )}
      </div>
    </MobileBottomSheet>
  );
}
