"use client";

import * as React from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAppStore } from "@/lib/store";

export function EditBudgetPopover({ budgetId, currentLimit }: { budgetId: string; currentLimit: number }) {
  const updateBudget = useAppStore((s) => s.updateBudget);
  const [value, setValue] = React.useState(String(currentLimit));
  const [open, setOpen] = React.useState(false);

  function save() {
    const num = Number(value);
    if (num > 0) {
      updateBudget(budgetId, { limit: num });
      toast.success("Budget updated");
    }
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="size-6 text-muted-foreground">
          <Pencil className="size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Monthly limit</Label>
          <Input value={value} onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, ""))} />
        </div>
        <Button size="sm" className="w-full" onClick={save}>
          Save
        </Button>
      </PopoverContent>
    </Popover>
  );
}
