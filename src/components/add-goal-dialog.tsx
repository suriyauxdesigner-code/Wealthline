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

const COLORS = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "chart-6"];

export function AddGoalDialog() {
  const [open, setOpen] = React.useState(false);
  const addGoal = useAppStore((s) => s.addGoal);

  const [name, setName] = React.useState("");
  const [target, setTarget] = React.useState("");
  const [current, setCurrent] = React.useState("");
  const [contribution, setContribution] = React.useState("");
  const [date, setDate] = React.useState<Date | undefined>();

  function reset() {
    setName("");
    setTarget("");
    setCurrent("");
    setContribution("");
    setDate(undefined);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !target || !date) return;
    addGoal({
      name,
      icon: "ShieldCheck",
      targetAmount: Number(target),
      currentAmount: Number(current) || 0,
      targetDate: date.toISOString().slice(0, 10),
      monthlyContribution: Number(contribution) || 0,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    });
    toast.success("Goal created", { description: name });
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> New goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>New goal</DialogTitle>
          <DialogDescription>Track progress toward a savings target.</DialogDescription>
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
            <Button type="submit">Create goal</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
