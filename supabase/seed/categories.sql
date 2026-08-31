-- Wealthline — default system categories, shared by every user (user_id is NULL).
-- Run once, after 0001_init.sql. Safe to re-run (guarded by a name+kind check).

insert into
  public.categories (name, kind, icon, color, user_id)
select
  v.name,
  v.kind,
  v.icon,
  v.color,
  null
from
  (
    values
      ('Housing', 'expense', 'Home', 'chart-1'),
      (
        'Food',
        'expense',
        'UtensilsCrossed',
        'chart-2'
      ),
      ('Transport', 'expense', 'Car', 'chart-3'),
      (
        'Shopping',
        'expense',
        'ShoppingBag',
        'chart-4'
      ),
      (
        'Entertainment',
        'expense',
        'Clapperboard',
        'chart-5'
      ),
      ('Travel', 'expense', 'Plane', 'chart-6'),
      ('Bills', 'expense', 'Receipt', 'chart-7'),
      (
        'Healthcare',
        'expense',
        'HeartPulse',
        'chart-8'
      ),
      (
        'Other',
        'expense',
        'MoreHorizontal',
        'chart-9'
      ),
      ('Salary', 'income', 'Wallet', 'chart-1'),
      (
        'Freelance',
        'income',
        'Briefcase',
        'chart-2'
      ),
      (
        'Transfer',
        'transfer',
        'ArrowLeftRight',
        'chart-6'
      ),
      (
        'Investment',
        'investment',
        'TrendingUp',
        'chart-4'
      )
  ) as v (name, kind, icon, color)
where
  not exists (
    select 1
    from public.categories c
    where
      c.user_id is null
      and c.name = v.name
      and c.kind = v.kind
  );
