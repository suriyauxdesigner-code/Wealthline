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
import { DatePicker } from "@/components/ui/date-picker";
import { useAppStore } from "@/lib/store";
import type { Goal } from "@/lib/types";

const COLORS = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "chart-6"];

interface AddGoalDialogProps {
  /** When set, the dialog edits this goal instead of creating one. */
  editGoal?: Goal;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddGoalDialog({ editGoal, trigger, open: openProp, onOpenChange }: AddGoalDialogProps) {
  const isEdit = !!editGoal;
  const [openState, setOpenState] = React.useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChange ?? setOpenState;

  const addGoal = useAppStore((s) => s.addGoal);
  const updateGoal = useAppStore((s) => s.updateGoal);

  const [name, setName] = React.useState(editGoal?.name ?? "");
  const [target, setTarget] = React.useState(editGoal ? String(editGoal.targetAmount) : "");
  const [current, setCurrent] = React.useState(editGoal ? String(editGoal.currentAmount) : "");
  const [contribution, setContribution] = React.useState(editGoal ? String(editGoal.monthlyContribution) : "");
  const [date, setDate] = React.useState<Date | undefined>(editGoal ? new Date(editGoal.targetDate) : undefined);

  function reset() {
    if (isEdit) return;
    setName("");
    setTarget("");
    setCurrent("");
    setContribution("");
    setDate(undefined);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !target || !date) return;

    if (isEdit) {
      await updateGoal(editGoal!.id, {
        name,
        targetAmount: Number(target),
        currentAmount: Number(current) || 0,
        targetDate: date.toISOString().slice(0, 10),
        monthlyContribution: Number(contribution) || 0,
      });
      toast.success("Goal updated", { description: name });
    } else {
      await addGoal({
        name,
        icon: "ShieldCheck",
        targetAmount: Number(target),
        currentAmount: Number(current) || 0,
        targetDate: date.toISOString().slice(0, 10),
        monthlyContribution: Number(contribution) || 0,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
      toast.success("Goal created", { description: name });
    }
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      {trigger !== null && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button size="sm">
              <Plus /> New goal
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit goal" : "New goal"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this goal's details." : "Track progress toward a savings target."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="goal-name">Name</Label>
            <Input id="goal-name" placeholder="e.g. New Laptop" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Target amount</Label>
              <Input value={target} onChange={(e) => setTarget(e.target.value.replace(/[^0-9]/g, ""))} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Current amount</Label>
              <Input value={current} onChange={(e) => setCurrent(e.target.value.replace(/[^0-9]/g, ""))} placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Target date</Label>
              <DatePicker date={date} onSelect={setDate} placeholder="Select" />
            </div>
            <div className="space-y-1.5">
              <Label>Monthly contribution</Label>
              <Input value={contribution} onChange={(e) => setContribution(e.target.value.replace(/[^0-9]/g, ""))} placeholder="0" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEdit ? "Save changes" : "Create goal"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
