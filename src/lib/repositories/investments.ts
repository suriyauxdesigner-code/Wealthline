import { createClient } from "@/lib/supabase/client";
import type { Investment } from "@/lib/types";

interface InvestmentRow {
  id: string;
  account_id: string;
  asset_name: string;
  asset_class: Investment["assetClass"];
  quantity: number;
  average_cost: number;
  current_price: number;
}

const COLUMNS = "id, account_id, asset_name, asset_class, quantity, average_cost, current_price";

function mapInvestment(row: InvestmentRow): Investment {
  return {
    id: row.id,
    accountId: row.account_id,
    name: row.asset_name,
    assetClass: row.asset_class,
    quantity: row.quantity,
    averageCost: row.average_cost,
    currentPrice: row.current_price,
  };
}

export async function listInvestments(): Promise<Investment[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("investments").select(COLUMNS).order("created_at");
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapInvestment);
}

export async function createInvestment(input: Omit<Investment, "id">): Promise<Investment> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("investments")
    .insert({
      account_id: input.accountId,
      asset_name: input.name,
      asset_class: input.assetClass,
      quantity: input.quantity,
      average_cost: input.averageCost,
      current_price: input.currentPrice,
    })
    .select(COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return mapInvestment(data);
}

export async function updateInvestment(id: string, patch: Partial<Investment>): Promise<Investment> {
  const supabase = createClient();
  const update: Record<string, unknown> = {};
  if (patch.accountId !== undefined) update.account_id = patch.accountId;
  if (patch.name !== undefined) update.asset_name = patch.name;
  if (patch.assetClass !== undefined) update.asset_class = patch.assetClass;
  if (patch.quantity !== undefined) update.quantity = patch.quantity;
  if (patch.averageCost !== undefined) update.average_cost = patch.averageCost;
  if (patch.currentPrice !== undefined) update.current_price = patch.currentPrice;

  const { data, error } = await supabase.from("investments").update(update).eq("id", id).select(COLUMNS).single();
  if (error) throw new Error(error.message);
  return mapInvestment(data);
}

export async function deleteInvestment(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("investments").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
