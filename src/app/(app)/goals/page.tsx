"use client";

import { MoreHorizontal, Trash2 } from "lucide-react";

import { AddGoalDialog } from "@/components/add-goal-dialog";
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
import { Target } from "lucide-react";
import { toast } from "sonner";

export default function GoalsPage() {
  const { goals, deleteGoal } = useAppStore();

  return (
    <div className="space-y-6">
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
    </div>
  );
}
