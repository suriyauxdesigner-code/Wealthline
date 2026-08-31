import { createClient } from "@/lib/supabase/client";
import type { Liability } from "@/lib/types";

interface LiabilityRow {
  id: string;
  account_id: string | null;
  name: string;
  type: Liability["type"];
  principal: number;
  outstanding_amount: number;
  interest_rate: number;
  monthly_payment: number;
}

const COLUMNS = "id, account_id, name, type, principal, outstanding_amount, interest_rate, monthly_payment";

function mapLiability(row: LiabilityRow): Liability {
  return {
    id: row.id,
    accountId: row.account_id ?? undefined,
    name: row.name,
    type: row.type,
    principal: row.principal,
    outstanding: row.outstanding_amount,
    interestRate: row.interest_rate,
    monthlyPayment: row.monthly_payment,
  };
}

export async function listLiabilities(): Promise<Liability[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("liabilities").select(COLUMNS).order("created_at");
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapLiability);
}

export async function createLiability(input: Omit<Liability, "id">): Promise<Liability> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("liabilities")
    .insert({
      account_id: input.accountId ?? null,
      name: input.name,
      type: input.type,
      principal: input.principal,
      outstanding_amount: input.outstanding,
      interest_rate: input.interestRate,
      monthly_payment: input.monthlyPayment,
    })
    .select(COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return mapLiability(data);
}

export async function updateLiability(id: string, patch: Partial<Liability>): Promise<Liability> {
  const supabase = createClient();
  const update: Record<string, unknown> = {};
  if (patch.accountId !== undefined) update.account_id = patch.accountId ?? null;
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.type !== undefined) update.type = patch.type;
  if (patch.principal !== undefined) update.principal = patch.principal;
  if (patch.outstanding !== undefined) update.outstanding_amount = patch.outstanding;
  if (patch.interestRate !== undefined) update.interest_rate = patch.interestRate;
  if (patch.monthlyPayment !== undefined) update.monthly_payment = patch.monthlyPayment;

  const { data, error } = await supabase.from("liabilities").update(update).eq("id", id).select(COLUMNS).single();
  if (error) throw new Error(error.message);
  return mapLiability(data);
}

export async function deleteLiability(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("liabilities").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
