-- Wealthline — budgets are set once, not re-created every month
--
-- A budget used to be scoped to a specific month ("2026-08"), so it had to
-- be re-added every month to keep tracking a category. That's not how
-- budgets work in practice — a category's monthly limit is a standing rule
-- until you change it. Drop the month scoping: one budget row per category,
-- period; "this month's spend" is still computed fresh each month from
-- transactions, just no longer requires a matching budget row to exist for
-- that specific month.

alter table public.budgets drop constraint if exists budgets_user_id_category_id_month_key;
alter table public.budgets drop column if exists month;

-- A category could have one budget row per month before this change — keep
-- only the most recently created row per (user_id, category_id) so the new
-- unique constraint below doesn't fail on leftover duplicates.
delete from public.budgets a using public.budgets b
where a.user_id = b.user_id
  and a.category_id = b.category_id
  and (a.created_at, a.id) < (b.created_at, b.id);

alter table public.budgets add constraint budgets_user_id_category_id_key unique (user_id, category_id);
