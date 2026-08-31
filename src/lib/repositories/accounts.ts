import { createClient } from "@/lib/supabase/client";
import type { Account } from "@/lib/types";

interface AccountRow {
  id: string;
  name: string;
  account_group: Account["group"];
  type: Account["type"];
  institution: string;
  currency: Account["currency"];
  balance: number;
  last4: string | null;
  is_liability_account: boolean;
  color: string | null;
}

const COLUMNS = "id, name, account_group, type, institution, currency, balance, last4, is_liability_account, color";

function mapAccount(row: AccountRow): Account {
  return {
    id: row.id,
    name: row.name,
    group: row.account_group,
    type: row.type,
    institution: row.institution,
    currency: row.currency,
    balance: row.balance,
    last4: row.last4 ?? undefined,
    isLiabilityAccount: row.is_liability_account,
    color: row.color ?? undefined,
  };
}

export async function listAccounts(): Promise<Account[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("accounts").select(COLUMNS).order("created_at");
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapAccount);
}

export async function createAccount(input: Omit<Account, "id">): Promise<Account> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("accounts")
    .insert({
      name: input.name,
      account_group: input.group,
      type: input.type,
      institution: input.institution,
      currency: input.currency,
      balance: input.balance,
      last4: input.last4 ?? null,
      is_liability_account: input.isLiabilityAccount ?? false,
      color: input.color ?? null,
    })
    .select(COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return mapAccount(data);
}

export async function updateAccount(id: string, patch: Partial<Account>): Promise<Account> {
  const supabase = createClient();
  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.group !== undefined) update.account_group = patch.group;
  if (patch.type !== undefined) update.type = patch.type;
  if (patch.institution !== undefined) update.institution = patch.institution;
  if (patch.currency !== undefined) update.currency = patch.currency;
  if (patch.balance !== undefined) update.balance = patch.balance;
  if (patch.last4 !== undefined) update.last4 = patch.last4 ?? null;
  if (patch.isLiabilityAccount !== undefined) update.is_liability_account = patch.isLiabilityAccount;
  if (patch.color !== undefined) update.color = patch.color ?? null;

  const { data, error } = await supabase.from("accounts").update(update).eq("id", id).select(COLUMNS).single();
  if (error) throw new Error(error.message);
  return mapAccount(data);
}

export async function deleteAccount(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("accounts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
