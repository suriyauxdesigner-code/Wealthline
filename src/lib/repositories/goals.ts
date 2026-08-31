import { createClient } from "@/lib/supabase/client";
import type { Goal } from "@/lib/types";

interface GoalRow {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  target_amount: number;
  current_amount: number;
  target_date: string;
  monthly_contribution: number;
}

const COLUMNS = "id, name, icon, color, target_amount, current_amount, target_date, monthly_contribution";

function mapGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon ?? "Target",
    color: row.color ?? "chart-1",
    targetAmount: row.target_amount,
    currentAmount: row.current_amount,
    targetDate: row.target_date,
    monthlyContribution: row.monthly_contribution,
  };
}

export async function listGoals(): Promise<Goal[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("goals").select(COLUMNS).order("target_date");
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapGoal);
}

export async function createGoal(input: Omit<Goal, "id">): Promise<Goal> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("goals")
    .insert({
      name: input.name,
      icon: input.icon,
      color: input.color,
      target_amount: input.targetAmount,
      current_amount: input.currentAmount,
      target_date: input.targetDate,
      monthly_contribution: input.monthlyContribution,
    })
    .select(COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return mapGoal(data);
}

export async function updateGoal(id: string, patch: Partial<Goal>): Promise<Goal> {
  const supabase = createClient();
  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.icon !== undefined) update.icon = patch.icon;
  if (patch.color !== undefined) update.color = patch.color;
  if (patch.targetAmount !== undefined) update.target_amount = patch.targetAmount;
  if (patch.currentAmount !== undefined) update.current_amount = patch.currentAmount;
  if (patch.targetDate !== undefined) update.target_date = patch.targetDate;
  if (patch.monthlyContribution !== undefined) update.monthly_contribution = patch.monthlyContribution;

  const { data, error } = await supabase.from("goals").update(update).eq("id", id).select(COLUMNS).single();
  if (error) throw new Error(error.message);
  return mapGoal(data);
}

export async function deleteGoal(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
