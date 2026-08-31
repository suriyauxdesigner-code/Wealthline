-- Wealthline — fix investments pricing model, add other_assets
--
-- 0001_init.sql stored investments as aggregate invested_amount/current_value,
-- but the app's actual model (src/lib/types.ts Investment, and
-- src/lib/calculations.ts calcInvestedValue/calcCurrentValue) is per-unit:
-- quantity * average_cost = invested, quantity * current_price = value. The
-- aggregates are always derivable from quantity + per-unit price, so storing
-- them separately is redundant and can drift. No data exists in this table
-- yet (never wired to any UI), so this is a safe in-place column swap.

alter table public.investments
drop column invested_amount,
drop column current_value,
add column current_price numeric not null;

-- ---------- other_assets ----------
-- Non-account assets (property, vehicles, etc.) that still count toward Net
-- Worth's asset side — missing from 0001_init.sql entirely (not part of the
-- original spec's table list, but the app's OtherAsset type needs a home).

create table public.other_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  name text not null,
  category text not null check (category in ('property', 'vehicle', 'other')),
  value numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index other_assets_user_id_idx on public.other_assets (user_id);

alter table public.other_assets enable row level security;

create policy "select own other_assets" on public.other_assets for select using (auth.uid () = user_id);

create policy "insert own other_assets" on public.other_assets for insert
with
  check (auth.uid () = user_id);

create policy "update own other_assets" on public.other_assets for update using (auth.uid () = user_id)
with
  check (auth.uid () = user_id);

create policy "delete own other_assets" on public.other_assets for delete using (auth.uid () = user_id);

create trigger set_updated_at before
update on public.other_assets for each row
execute function public.set_updated_at ();
