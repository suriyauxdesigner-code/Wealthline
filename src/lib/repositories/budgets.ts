import { createClient } from "@/lib/supabase/client";
import type { Budget } from "@/lib/types";

interface BudgetRow {
  id: string;
  category_id: string;
  amount: number;
  month: string;
}

const COLUMNS = "id, category_id, amount, month";

function mapBudget(row: BudgetRow): Budget {
  return { id: row.id, categoryId: row.category_id, limit: row.amount, month: row.month };
}

export async function listBudgets(): Promise<Budget[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("budgets").select(COLUMNS).order("month", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapBudget);
}

export async function createBudget(input: Omit<Budget, "id">): Promise<Budget> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("budgets")
    .insert({ category_id: input.categoryId, amount: input.limit, month: input.month })
    .select(COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return mapBudget(data);
}

export async function updateBudget(id: string, patch: Partial<Budget>): Promise<Budget> {
  const supabase = createClient();
  const update: Record<string, unknown> = {};
  if (patch.categoryId !== undefined) update.category_id = patch.categoryId;
  if (patch.limit !== undefined) update.amount = patch.limit;
  if (patch.month !== undefined) update.month = patch.month;

  const { data, error } = await supabase.from("budgets").update(update).eq("id", id).select(COLUMNS).single();
  if (error) throw new Error(error.message);
  return mapBudget(data);
}

export async function deleteBudget(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("budgets").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
