import { createClient } from "@/lib/supabase/client";
import type { OtherAsset } from "@/lib/types";

interface OtherAssetRow {
  id: string;
  name: string;
  category: OtherAsset["category"];
  value: number;
}

const COLUMNS = "id, name, category, value";

function mapOtherAsset(row: OtherAssetRow): OtherAsset {
  return { id: row.id, name: row.name, category: row.category, value: row.value };
}

export async function listOtherAssets(): Promise<OtherAsset[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("other_assets").select(COLUMNS).order("created_at");
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapOtherAsset);
}

export async function createOtherAsset(input: Omit<OtherAsset, "id">): Promise<OtherAsset> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("other_assets")
    .insert({ name: input.name, category: input.category, value: input.value })
    .select(COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return mapOtherAsset(data);
}

export async function updateOtherAsset(id: string, patch: Partial<OtherAsset>): Promise<OtherAsset> {
  const supabase = createClient();
  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.category !== undefined) update.category = patch.category;
  if (patch.value !== undefined) update.value = patch.value;

  const { data, error } = await supabase.from("other_assets").update(update).eq("id", id).select(COLUMNS).single();
  if (error) throw new Error(error.message);
  return mapOtherAsset(data);
}

export async function deleteOtherAsset(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("other_assets").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
