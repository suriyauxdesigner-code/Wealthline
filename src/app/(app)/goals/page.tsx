"use client";

import * as React from "react";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { Reveal } from "cube-motion/react";

import { AddGoalDialog } from "@/components/add-goal-dialog";
import { MobileAddGoalSheet } from "@/components/mobile/add-goal-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/finance/empty-state";
import { resolveIcon } from "@/components/finance/icon-map";
import { useAppStore } from "@/lib/store";
import { calcGoalProgress, calcRequiredMonthlyContribution, formatINR } from "@/lib/calculations";
import type { Goal } from "@/lib/types";
import { Target } from "lucide-react";
import { toast } from "sonner";

export default function GoalsPage() {
  const { goals, deleteGoal } = useAppStore();
  const [editing, setEditing] = React.useState<Goal | null>(null);
  const [mobileCreateOpen, setMobileCreateOpen] = React.useState(false);
  const [mobileEditing, setMobileEditing] = React.useState<Goal | null>(null);

  return (
    <>
      <div className="wl-mobile -mx-4 -mt-5 min-h-svh bg-wl-canvas px-6 pt-3 pb-6 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[28px] font-semibold leading-9 tracking-[-1.12px] text-wl-ink">Goals</p>
          <button
            onClick={() => setMobileCreateOpen(true)}
            className="flex size-11 items-center justify-center rounded-lg bg-wl-surface"
          >
            <Plus className="size-[22px] text-wl-ink" strokeWidth={1.75} />
          </button>
        </div>
        <p className="mt-3 text-[14px] font-semibold leading-5 tracking-[-0.56px] text-wl-muted">Make room for what matters.</p>

        {goals.length === 0 ? (
          <p className="mt-6 text-center text-[14px] font-medium text-wl-muted">No goals yet — tap + to start one.</p>
        ) : (
          <Reveal as="div" targets="children" className="mt-3 flex flex-col gap-3">
            {goals.map((goal) => {
              const progress = calcGoalProgress(goal.currentAmount, goal.targetAmount);
              const required = calcRequiredMonthlyContribution(goal.currentAmount, goal.targetAmount, goal.targetDate);
              const targetDateLabel = new Date(goal.targetDate).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
              return (
                <button
                  key={goal.id}
                  onClick={() => setMobileEditing(goal)}
                  className="flex flex-col gap-1 rounded-lg bg-wl-surface p-4 text-left"
                >
                  <p className="text-[16px] font-semibold leading-6 tracking-[-0.32px] text-wl-ink">{goal.name}</p>
                  <p className="text-[28px] font-semibold leading-9 tracking-[-1.12px] text-wl-ink">{formatINR(goal.currentAmount)}</p>
                  <p className="text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">
                    of {formatINR(goal.targetAmount)} · {targetDateLabel}
                  </p>
                  <div className="mt-1 h-[3px] w-full rounded-lg bg-wl-disabled">
                    <div className="h-full rounded-lg bg-wl-accent" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-1 text-[12px] font-medium leading-4 tracking-[-0.48px] text-wl-muted">
                    {goal.monthlyContribution > 0 ? `${formatINR(required)} / month to reach your goal` : "Set a monthly contribution"}
                  </p>
                </button>
              );
            })}
          </Reveal>
        )}
      </div>

      {mobileCreateOpen && <MobileAddGoalSheet open={mobileCreateOpen} onOpenChange={setMobileCreateOpen} />}
      {mobileEditing && (
        <MobileAddGoalSheet open={!!mobileEditing} onOpenChange={(v) => !v && setMobileEditing(null)} editGoal={mobileEditing} />
      )}

      <div className="hidden space-y-6 lg:block">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Goals</h1>
          <p className="text-sm text-muted-foreground">{goals.length} active goals</p>
        </div>
        <AddGoalDialog />
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState icon={Target} title="No goals yet" description="Create a goal to start tracking progress toward it." action={<AddGoalDialog />} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const Icon = resolveIcon(goal.icon);
            const progress = calcGoalProgress(goal.currentAmount, goal.targetAmount);
            const required = calcRequiredMonthlyContribution(goal.currentAmount, goal.targetAmount, goal.targetDate);
            const targetDateLabel = new Date(goal.targetDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
            const onPace = goal.monthlyContribution >= required * 0.95;

            return (
              <Card key={goal.id} className="gap-3 py-4">
                <CardContent className="space-y-3 px-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex size-8 items-center justify-center rounded-md"
                        style={{ backgroundColor: `color-mix(in oklch, var(--${goal.color}) 15%, transparent)` }}
                      >
                        <Icon className="size-4" style={{ color: `var(--${goal.color})` }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-tight">{goal.name}</p>
                        <p className="text-xs text-muted-foreground">Target: {targetDateLabel}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-7">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditing(goal)}>
                          <Pencil /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            deleteGoal(goal.id);
                            toast.success("Goal removed");
                          }}
                        >
                          <Trash2 /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-semibold tabular-nums">{formatINR(goal.currentAmount, { compact: true })}</span>
                    <span className="text-xs text-muted-foreground">of {formatINR(goal.targetAmount, { compact: true })}</span>
                  </div>
                  <Progress value={progress} />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{progress.toFixed(0)}% funded</span>
                    <span className={onPace ? "text-positive" : "text-warning-foreground"}>
                      {onPace ? "On pace" : "Behind pace"}
                    </span>
                  </div>
                  <div className="border-t border-border/70 pt-2 text-xs text-muted-foreground">
                    Required monthly contribution:{" "}
                    <span className="font-medium text-foreground">{formatINR(required, { compact: true })}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {editing && (
        <AddGoalDialog
          trigger={null}
          editGoal={editing}
          open={!!editing}
          onOpenChange={(v) => !v && setEditing(null)}
        />
      )}
      </div>
    </>
  );
}
