-- Wealthline — initial schema
--
-- Covers all entities in the product spec. Only `profiles`, `categories`,
-- `accounts`, `transactions`, and `fire_profiles` are wired to the UI in
-- Phase 1 (see the repository layer under src/lib/repositories/); the rest
-- exist now so later phases don't need another schema migration.
--
-- Every user-owned table carries `user_id uuid ... default auth.uid()` and a
-- matching Row Level Security policy — the database is the actual security
-- boundary, not the frontend.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- profiles ----------

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid() unique,
  name text not null,
  country text not null default 'India',
  currency text not null default 'INR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "select own profile" on public.profiles for select using (auth.uid () = user_id);

create policy "insert own profile" on public.profiles for insert
with
  check (auth.uid () = user_id);

create policy "update own profile" on public.profiles for update using (auth.uid () = user_id)
with
  check (auth.uid () = user_id);

create policy "delete own profile" on public.profiles for delete using (auth.uid () = user_id);

create trigger set_updated_at before
update on public.profiles for each row
execute function public.set_updated_at ();

-- ---------- categories ----------
-- user_id is NULL for shared system defaults (readable by everyone, not
-- writable by users), non-null for a user's own custom categories.

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('expense', 'income', 'transfer', 'investment')),
  icon text not null,
  color text not null,
  created_at timestamptz not null default now()
);

create index categories_user_id_idx on public.categories (user_id);

alter table public.categories enable row level security;

create policy "select system or own categories" on public.categories for select using (
  user_id is null
  or auth.uid () = user_id
);

create policy "insert own categories" on public.categories for insert
with
  check (auth.uid () = user_id);

create policy "update own categories" on public.categories for update using (auth.uid () = user_id)
with
  check (auth.uid () = user_id);

create policy "delete own categories" on public.categories for delete using (auth.uid () = user_id);

-- ---------- accounts ----------
-- `account_group`, `last4`, `is_liability_account`, `color` extend the spec's
-- listed columns — the existing Account UI (account cards, icon lookup)
-- needs them. Named `account_group` rather than the spec's `type`/`group`
-- split's literal "group" — that's a reserved SQL word, awkward to quote in
-- every PostgREST query string.

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  name text not null,
  account_group text not null check (
    account_group in (
      'cash',
      'bank',
      'credit',
      'investment',
      'other'
    )
  ),
  type text not null,
  institution text not null,
  currency text not null default 'INR',
  balance numeric not null default 0,
  last4 text,
  is_liability_account boolean not null default false,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index accounts_user_id_idx on public.accounts (user_id);

alter table public.accounts enable row level security;

create policy "select own accounts" on public.accounts for select using (auth.uid () = user_id);

create policy "insert own accounts" on public.accounts for insert
with
  check (auth.uid () = user_id);

create policy "update own accounts" on public.accounts for update using (auth.uid () = user_id)
with
  check (auth.uid () = user_id);

create policy "delete own accounts" on public.accounts for delete using (auth.uid () = user_id);

create trigger set_updated_at before
update on public.accounts for each row
execute function public.set_updated_at ();

-- ---------- transactions ----------
-- `to_account_id`, `tags`, `recurring_id`, `attachment` extend the spec's
-- listed columns to match the existing Transaction type in full.

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  to_account_id uuid references public.accounts (id) on delete set null,
  type text not null check (
    type in (
      'expense',
      'income',
      'transfer',
      'investment'
    )
  ),
  amount numeric not null,
  category_id uuid references public.categories (id) on delete set null,
  merchant text not null,
  date date not null,
  notes text,
  tags text[],
  recurring_id uuid,
  attachment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index transactions_user_id_idx on public.transactions (user_id);

create index transactions_account_id_idx on public.transactions (account_id);

create index transactions_date_idx on public.transactions (date);

alter table public.transactions enable row level security;

create policy "select own transactions" on public.transactions for select using (auth.uid () = user_id);

create policy "insert own transactions" on public.transactions for insert
with
  check (auth.uid () = user_id);

create policy "update own transactions" on public.transactions for update using (auth.uid () = user_id)
with
  check (auth.uid () = user_id);

create policy "delete own transactions" on public.transactions for delete using (auth.uid () = user_id);

create trigger set_updated_at before
update on public.transactions for each row
execute function public.set_updated_at ();

-- ---------- budgets ----------

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  category_id uuid not null references public.categories (id) on delete cascade,
  amount numeric not null,
  month text not null, -- "2026-08"
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, category_id, month)
);

create index budgets_user_id_idx on public.budgets (user_id);

alter table public.budgets enable row level security;

create policy "select own budgets" on public.budgets for select using (auth.uid () = user_id);

create policy "insert own budgets" on public.budgets for insert
with
  check (auth.uid () = user_id);

create policy "update own budgets" on public.budgets for update using (auth.uid () = user_id)
with
  check (auth.uid () = user_id);

create policy "delete own budgets" on public.budgets for delete using (auth.uid () = user_id);

create trigger set_updated_at before
update on public.budgets for each row
execute function public.set_updated_at ();

-- ---------- investments ----------

create table public.investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  asset_name text not null,
  asset_class text not null check (
    asset_class in (
      'equity',
      'etf',
      'mutual_fund',
      'gold',
      'bonds',
      'fd',
      'epf',
      'ppf',
      'crypto'
    )
  ),
  quantity numeric not null,
  average_cost numeric not null,
  invested_amount numeric not null,
  current_value numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index investments_user_id_idx on public.investments (user_id);

alter table public.investments enable row level security;

create policy "select own investments" on public.investments for select using (auth.uid () = user_id);

create policy "insert own investments" on public.investments for insert
with
  check (auth.uid () = user_id);

create policy "update own investments" on public.investments for update using (auth.uid () = user_id)
with
  check (auth.uid () = user_id);

create policy "delete own investments" on public.investments for delete using (auth.uid () = user_id);

create trigger set_updated_at before
update on public.investments for each row
execute function public.set_updated_at ();

-- ---------- investment_transactions ----------

create table public.investment_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  investment_id uuid not null references public.investments (id) on delete cascade,
  type text not null check (type in ('buy', 'sell', 'dividend')),
  quantity numeric not null,
  price numeric not null,
  amount numeric not null,
  date date not null
);

create index investment_transactions_user_id_idx on public.investment_transactions (user_id);

alter table public.investment_transactions enable row level security;

create policy "select own investment_transactions" on public.investment_transactions for select using (auth.uid () = user_id);

create policy "insert own investment_transactions" on public.investment_transactions for insert
with
  check (auth.uid () = user_id);

create policy "update own investment_transactions" on public.investment_transactions for update using (auth.uid () = user_id)
with
  check (auth.uid () = user_id);

create policy "delete own investment_transactions" on public.investment_transactions for delete using (auth.uid () = user_id);

-- ---------- liabilities ----------

create table public.liabilities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  account_id uuid references public.accounts (id) on delete set null,
  name text not null,
  type text not null check (
    type in (
      'credit_card',
      'personal_loan',
      'vehicle_loan',
      'home_loan',
      'education_loan',
      'other'
    )
  ),
  principal numeric not null,
  outstanding_amount numeric not null,
  interest_rate numeric not null,
  monthly_payment numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index liabilities_user_id_idx on public.liabilities (user_id);

alter table public.liabilities enable row level security;

create policy "select own liabilities" on public.liabilities for select using (auth.uid () = user_id);

create policy "insert own liabilities" on public.liabilities for insert
with
  check (auth.uid () = user_id);

create policy "update own liabilities" on public.liabilities for update using (auth.uid () = user_id)
with
  check (auth.uid () = user_id);

create policy "delete own liabilities" on public.liabilities for delete using (auth.uid () = user_id);

create trigger set_updated_at before
update on public.liabilities for each row
execute function public.set_updated_at ();

-- ---------- goals ----------
-- `icon`, `color` extend the spec's listed columns — goal cards display both.

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  name text not null,
  icon text,
  color text,
  target_amount numeric not null,
  current_amount numeric not null default 0,
  target_date date not null,
  monthly_contribution numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index goals_user_id_idx on public.goals (user_id);

alter table public.goals enable row level security;

create policy "select own goals" on public.goals for select using (auth.uid () = user_id);

create policy "insert own goals" on public.goals for insert
with
  check (auth.uid () = user_id);

create policy "update own goals" on public.goals for update using (auth.uid () = user_id)
with
  check (auth.uid () = user_id);

create policy "delete own goals" on public.goals for delete using (auth.uid () = user_id);

create trigger set_updated_at before
update on public.goals for each row
execute function public.set_updated_at ();

-- ---------- fire_profiles ----------
-- `current_net_worth`, `income_growth`, `life_expectancy` extend the spec's
-- listed columns — the FIRE projection math (src/lib/calculations.ts) needs
-- all three.

create table public.fire_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid() unique,
  current_age integer not null,
  target_retirement_age integer not null,
  current_net_worth numeric not null default 0,
  annual_expenses numeric not null,
  monthly_investment numeric not null default 0,
  expected_return numeric not null default 11,
  income_growth numeric not null default 8,
  inflation numeric not null default 6,
  withdrawal_rate numeric not null default 3.5,
  life_expectancy integer not null default 85,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fire_profiles enable row level security;

create policy "select own fire_profile" on public.fire_profiles for select using (auth.uid () = user_id);

create policy "insert own fire_profile" on public.fire_profiles for insert
with
  check (auth.uid () = user_id);

create policy "update own fire_profile" on public.fire_profiles for update using (auth.uid () = user_id)
with
  check (auth.uid () = user_id);

create policy "delete own fire_profile" on public.fire_profiles for delete using (auth.uid () = user_id);

create trigger set_updated_at before
update on public.fire_profiles for each row
execute function public.set_updated_at ();

-- ---------- recurring_transactions ----------
-- `label`, `start_date`, `end_date`, `to_account_id` extend the spec's listed
-- columns to match the existing RecurringTransaction type in full.

create table public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  to_account_id uuid references public.accounts (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  label text not null,
  type text not null check (
    type in (
      'expense',
      'income',
      'transfer',
      'investment'
    )
  ),
  amount numeric not null,
  frequency text not null check (
    frequency in (
      'weekly',
      'monthly',
      'quarterly',
      'yearly'
    )
  ),
  start_date date not null,
  end_date date,
  next_occurrence date not null,
  active boolean not null default true
);

create index recurring_transactions_user_id_idx on public.recurring_transactions (user_id);

alter table public.recurring_transactions enable row level security;

create policy "select own recurring_transactions" on public.recurring_transactions for select using (auth.uid () = user_id);

create policy "insert own recurring_transactions" on public.recurring_transactions for insert
with
  check (auth.uid () = user_id);

create policy "update own recurring_transactions" on public.recurring_transactions for update using (auth.uid () = user_id)
with
  check (auth.uid () = user_id);

create policy "delete own recurring_transactions" on public.recurring_transactions for delete using (auth.uid () = user_id);
