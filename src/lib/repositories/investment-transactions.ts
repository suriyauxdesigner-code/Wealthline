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

export async function deleteInvestmentTransaction(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("investment_transactions").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
