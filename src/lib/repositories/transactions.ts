import { createClient } from "@/lib/supabase/client";
import type { Transaction } from "@/lib/types";

interface TransactionRow {
  id: string;
  account_id: string;
  to_account_id: string | null;
  liability_id: string | null;
  type: Transaction["type"];
  amount: number;
  category_id: string | null;
  merchant: string;
  date: string;
  notes: string | null;
  tags: string[] | null;
  recurring_id: string | null;
  attachment: string | null;
}

const COLUMNS =
  "id, account_id, to_account_id, liability_id, type, amount, category_id, merchant, date, notes, tags, recurring_id, attachment";

function mapTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type,
    amount: row.amount,
    merchant: row.merchant,
    categoryId: row.category_id ?? "",
    accountId: row.account_id,
    toAccountId: row.to_account_id ?? undefined,
    liabilityId: row.liability_id ?? undefined,
    date: row.date,
    notes: row.notes ?? undefined,
    tags: row.tags ?? undefined,
    recurringId: row.recurring_id ?? undefined,
    attachment: row.attachment ?? undefined,
  };
}

export async function listTransactions(): Promise<Transaction[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("transactions").select(COLUMNS).order("date", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapTransaction);
}

export async function createTransaction(input: Omit<Transaction, "id">): Promise<Transaction> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      account_id: input.accountId,
      to_account_id: input.toAccountId ?? null,
      liability_id: input.liabilityId ?? null,
      type: input.type,
      amount: input.amount,
      category_id: input.categoryId || null,
      merchant: input.merchant,
      date: input.date,
      notes: input.notes ?? null,
      tags: input.tags ?? null,
      recurring_id: input.recurringId ?? null,
      attachment: input.attachment ?? null,
    })
    .select(COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return mapTransaction(data);
}

export async function updateTransaction(id: string, patch: Partial<Transaction>): Promise<Transaction> {
  const supabase = createClient();
  const update: Record<string, unknown> = {};
  if (patch.accountId !== undefined) update.account_id = patch.accountId;
  if (patch.toAccountId !== undefined) update.to_account_id = patch.toAccountId ?? null;
  if (patch.liabilityId !== undefined) update.liability_id = patch.liabilityId ?? null;
  if (patch.type !== undefined) update.type = patch.type;
  if (patch.amount !== undefined) update.amount = patch.amount;
  if (patch.categoryId !== undefined) update.category_id = patch.categoryId || null;
  if (patch.merchant !== undefined) update.merchant = patch.merchant;
  if (patch.date !== undefined) update.date = patch.date;
  if (patch.notes !== undefined) update.notes = patch.notes ?? null;
  if (patch.tags !== undefined) update.tags = patch.tags ?? null;
  if (patch.recurringId !== undefined) update.recurring_id = patch.recurringId ?? null;
  if (patch.attachment !== undefined) update.attachment = patch.attachment ?? null;

  const { data, error } = await supabase.from("transactions").update(update).eq("id", id).select(COLUMNS).single();
  if (error) throw new Error(error.message);
  return mapTransaction(data);
}

// Returns the deleted row so callers can reverse any side effect it had
// (e.g. a debt payment) before it's gone.
export async function deleteTransaction(id: string): Promise<Transaction> {
  const supabase = createClient();
  const { data, error } = await supabase.from("transactions").delete().eq("id", id).select(COLUMNS).single();
  if (error) throw new Error(error.message);
  return mapTransaction(data);
}

export async function deleteTransactions(ids: string[]): Promise<Transaction[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("transactions").delete().in("id", ids).select(COLUMNS);
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapTransaction);
}
