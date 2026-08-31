import { createClient } from "@/lib/supabase/client";
import type { InvestmentTransaction } from "@/lib/types";

interface InvestmentTransactionRow {
  id: string;
  investment_id: string;
  type: InvestmentTransaction["type"];
  quantity: number;
  price: number;
  amount: number;
  date: string;
}

const COLUMNS = "id, investment_id, type, quantity, price, amount, date";

function mapInvestmentTransaction(row: InvestmentTransactionRow): InvestmentTransaction {
  return {
    id: row.id,
    investmentId: row.investment_id,
    type: row.type,
    quantity: row.quantity,
    price: row.price,
    amount: row.amount,
    date: row.date,
  };
}

export async function listInvestmentTransactions(investmentId: string): Promise<InvestmentTransaction[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("investment_transactions")
    .select(COLUMNS)
    .eq("investment_id", investmentId)
    .order("date", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapInvestmentTransaction);
}

export async function createInvestmentTransaction(
  input: Omit<InvestmentTransaction, "id" | "amount">
): Promise<InvestmentTransaction> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("investment_transactions")
    .insert({
      investment_id: input.investmentId,
      type: input.type,
      quantity: input.quantity,
      price: input.price,
      amount: input.quantity * input.price,
      date: input.date,
    })
    .select(COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return mapInvestmentTransaction(data);
}

// Used when a Buy/Sell is logged from the main Add Transaction dialog
// against a specific holding — links this row to the Transaction that
// caused it (linked_transaction_id has ON DELETE CASCADE, so deleting that
// transaction removes this row automatically).
export async function createLinkedInvestmentTransaction(
  input: Omit<InvestmentTransaction, "id" | "amount"> & { linkedTransactionId: string }
): Promise<InvestmentTransaction> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("investment_transactions")
    .insert({
      investment_id: input.investmentId,
      type: input.type,
      quantity: input.quantity,
      price: input.price,
      amount: input.quantity * input.price,
      date: input.date,
      linked_transaction_id: input.linkedTransactionId,
    })
    .select(COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return mapInvestmentTransaction(data);
}

export async function getInvestmentTransactionByLinkedTransaction(
  transactionId: string
): Promise<InvestmentTransaction | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("investment_transactions")
    .select(COLUMNS)
    .eq("linked_transaction_id", transactionId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapInvestmentTransaction(data) : null;
}

export async function updateInvestmentTransaction(
  id: string,
  patch: { type: InvestmentTransaction["type"]; quantity: number; price: number; date: string }
): Promise<InvestmentTransaction> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("investment_transactions")
    .update({
      type: patch.type,
      quantity: patch.quantity,
      price: patch.price,
      amount: patch.quantity * patch.price,
      date: patch.date,
    })
    .eq("id", id)
    .select(COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return mapInvestmentTransaction(data);
}

export async function deleteInvestmentTransaction(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("investment_transactions").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
