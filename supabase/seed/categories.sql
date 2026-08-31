-- Wealthline — default system categories, shared by every user (user_id is NULL).
-- Run once, after 0001_init.sql. Safe to re-run (upserts on id).
--
-- These ids are fixed (not random) so they match src/lib/mock-data.ts's
-- CATEGORY_IDS — mock budgets/recurring transactions reference the same
-- ids, and once real (Supabase) transactions exist, their category_id must
-- resolve against this same set for budget-vs-actual comparisons to work.

insert into
  public.categories (id, name, kind, icon, color, user_id)
values
  (
    '00000000-0000-4000-8000-000000000001',
    'Housing',
    'expense',
    'Home',
    'chart-1',
    null
  ),
  (
    '00000000-0000-4000-8000-000000000002',
    'Food',
    'expense',
    'UtensilsCrossed',
    'chart-2',
    null
  ),
  (
    '00000000-0000-4000-8000-000000000003',
    'Transport',
    'expense',
    'Car',
    'chart-3',
    null
  ),
  (
    '00000000-0000-4000-8000-000000000004',
    'Shopping',
    'expense',
    'ShoppingBag',
    'chart-4',
    null
  ),
  (
    '00000000-0000-4000-8000-000000000005',
    'Entertainment',
    'expense',
    'Clapperboard',
    'chart-5',
    null
  ),
  (
    '00000000-0000-4000-8000-000000000006',
    'Travel',
    'expense',
    'Plane',
    'chart-6',
    null
  ),
  (
    '00000000-0000-4000-8000-000000000007',
    'Bills',
    'expense',
    'Receipt',
    'chart-7',
    null
  ),
  (
    '00000000-0000-4000-8000-000000000008',
    'Healthcare',
    'expense',
    'HeartPulse',
    'chart-8',
    null
  ),
  (
    '00000000-0000-4000-8000-000000000009',
    'Other',
    'expense',
    'MoreHorizontal',
    'chart-9',
    null
  ),
  (
    '00000000-0000-4000-8000-000000000010',
    'Salary',
    'income',
    'Wallet',
    'chart-1',
    null
  ),
  (
    '00000000-0000-4000-8000-000000000011',
    'Freelance',
    'income',
    'Briefcase',
    'chart-2',
    null
  ),
  (
    '00000000-0000-4000-8000-000000000012',
    'Transfer',
    'transfer',
    'ArrowLeftRight',
    'chart-6',
    null
  ),
  (
    '00000000-0000-4000-8000-000000000013',
    'Investment',
    'investment',
    'TrendingUp',
    'chart-4',
    null
  )
on conflict (id) do update
set
  name = excluded.name,
  kind = excluded.kind,
  icon = excluded.icon,
  color = excluded.color;
