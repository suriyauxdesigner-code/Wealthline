import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/types";

interface CategoryRow {
  id: string;
  name: string;
  kind: Category["kind"];
  icon: string;
  color: string;
}

function mapCategory(row: CategoryRow): Category {
  return { id: row.id, name: row.name, kind: row.kind, icon: row.icon, color: row.color };
}

// Read-only in Phase 1 — no "create category" UI yet. Returns system
// defaults (user_id null) plus the current user's own, per the categories
// RLS policy.
export async function listCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("categories").select("id, name, kind, icon, color").order("name");
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapCategory);
}
